import React, { useState, useEffect } from 'react';
import { db, storage } from '../services/Firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, writeBatch, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

function SubscriptionRequests() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'subscriptions'));
        const subs = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.seconds
              ? new Date(data.submittedAt.seconds * 1000)
              : null,
            approvedAt: data.approvedAt?.seconds
              ? new Date(data.approvedAt.seconds * 1000)
              : null,
          };
        });
        setSubscriptions(subs);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        alert('Failed to load subscriptions. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleApprove = async (subscription) => {
    if (!subscription || !subscription.userId || !subscription.id) {
      console.error('Error approving subscription: Missing subscription data');
      alert('Failed to approve: Missing subscription data.');
      return;
    }

    try {
      setApprovingId(subscription.id);
      const batch = writeBatch(db);

      const courseToAdd = {
        id: subscription.courseId,
        title: subscription.courseTitle,
        enrolledAt: new Date().toISOString()
      };

      const userRef = doc(db, 'users', subscription.userId);
      batch.update(userRef, {
        enrolledCourses: arrayUnion(courseToAdd),
      });

      const subRef = doc(db, 'subscriptions', subscription.id);
      batch.update(subRef, {
        status: 'approved',
        approvedAt: new Date().toISOString()
      });

      await batch.commit();

      setSubscriptions(prevSubs =>
        prevSubs.map(sub =>
          sub.id === subscription.id
            ? { ...sub, status: 'approved', approvedAt: new Date() }
            : sub
        )
      );
      
      alert('Subscription approved successfully!');
    } catch (error) {
      console.error('Error approving subscription:', error);
      alert(`Failed to approve: ${error.message}`);
      setSubscriptions(prevSubs =>
        prevSubs.map(sub =>
          sub.id === subscription.id ? { ...sub, status: 'pending' } : sub
        )
      );
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (subscription) => {
    if (!subscription?.id) {
      console.error('Error deleting subscription: Missing ID');
      alert('Failed to delete: Missing subscription ID.');
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this subscription request? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(subscription.id);

      // Delete receipt from storage if it exists
      if (subscription.receiptUrl) {
        try {
          const storageRef = ref(storage, subscription.receiptUrl);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.warn('Could not delete receipt file:', storageError);
        }
      }

      // Delete subscription document
      await deleteDoc(doc(db, 'subscriptions', subscription.id));

      // Update local state
      setSubscriptions(prevSubs => 
        prevSubs.filter(sub => sub.id !== subscription.id)
      );
      
      alert('Subscription deleted successfully!');
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert(`Failed to delete: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-center text-gray-600 text-lg">
          Loading subscription requests...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-12">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Subscription Requests
      </h2>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Course Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date Submitted</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Receipt</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                  No subscription requests found
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{sub.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{sub.courseTitle}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {sub.submittedAt ? sub.submittedAt.toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {sub.receiptUrl ? (
                      <a
                        href={sub.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Receipt
                      </a>
                    ) : (
                      <span className="text-gray-400">No receipt</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        sub.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : sub.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      {sub.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(sub)}
                          disabled={approvingId === sub.id}
                          className={`px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 ${
                            approvingId === sub.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {approvingId === sub.id ? 'Approving...' : 'Approve'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(sub)}
                        disabled={deletingId === sub.id}
                        className={`px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 ${
                          deletingId === sub.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {deletingId === sub.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubscriptionRequests;