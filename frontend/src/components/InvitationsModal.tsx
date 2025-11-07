import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { chatAPI } from '../services/api';
import type { Invitation } from '../types';
import Button from './Button';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function InvitationsModal({ open, onClose }: Props) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) fetchInvitations();
  }, [open]);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const { data } = await chatAPI.getInvitations();
      setInvitations(data);
    } catch (err) {
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await chatAPI.acceptInvitation(id);
      toast.success('Invitation accepted');
      setInvitations((prev) => prev.filter((inv) => inv._id !== id));

      onClose();
      window.location.reload();
    } catch (err) {
      toast.error('Failed to accept invitation');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await chatAPI.rejectInvitation(id);
      toast.info('Invitation rejected');
      setInvitations((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      toast.error('Failed to reject invitation');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Invitations</h2>
        {loading ? (
          <div>Loading...</div>
        ) : invitations.length === 0 ? (
          <div>No pending invitations</div>
        ) : (
          <ul className="space-y-3">
            {invitations.map((inv) => (
              <li
                key={inv._id}
                className="flex justify-between items-center p-3 border rounded-md"
              >
                <div>
                  <p className="font-semibold">{inv.chat.name}</p>
                  <p className="text-sm text-gray-500">
                    Invited by {inv.inviter.fullName}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleAccept(inv._id)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleReject(inv._id)}
                  >
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
