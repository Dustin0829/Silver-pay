import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Bank {
  value: string;
  label: string;
  logo: string;
}

interface BankStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onUpdateStatus: (applicationId: string, bankStatus: Record<string, string>) => void;
  banks: Bank[];
}

const BankStatusModal: React.FC<BankStatusModalProps> = ({
  isOpen,
  onClose,
  application,
  onUpdateStatus,
  banks
}) => {
  const [bankStatus, setBankStatus] = useState<Record<string, string>>(
    application?.bankStatus || {}
  );

  const handleStatusChange = (bankValue: string, status: string) => {
    setBankStatus(prev => ({
      ...prev,
      [bankValue]: status
    }));
  };

  const handleSave = () => {
    onUpdateStatus(application.id, bankStatus);
    onClose();
  };

  const getStatusButtonClass = (bankValue: string, status: string) => {
    const currentStatus = bankStatus[bankValue];
    const isSelected = currentStatus === status;
    
    switch (status) {
      case 'accepted':
        return `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isSelected 
            ? 'bg-green-600 text-white' 
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`;
      case 'rejected':
        return `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isSelected 
            ? 'bg-red-600 text-white' 
            : 'bg-red-100 text-red-700 hover:bg-red-200'
        }`;
      case 'pending':
        return `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isSelected 
            ? 'bg-yellow-600 text-white' 
            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
        }`;
      default:
        return 'px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bank Status Management</h2>
            <p className="text-gray-600 mt-1">
              Set status for {application.personal_details?.firstName} {application.personal_details?.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Actions</h3>
            <div className="space-y-6">
              {banks.map((bank) => (
                <div key={bank.value} className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex items-center justify-center w-8 h-8 mr-3">
                      <img
                        src={bank.logo}
                        alt={`${bank.label} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div
                        className="hidden w-6 h-6 rounded-full bg-gray-200 items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <span className="font-bold text-xs text-gray-600">
                          {bank.label.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <span className="font-medium text-gray-900">{bank.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(bank.value, 'accepted')}
                      className={getStatusButtonClass(bank.value, 'accepted')}
                    >
                      Accepted
                    </button>
                    <button
                      onClick={() => handleStatusChange(bank.value, 'rejected')}
                      className={getStatusButtonClass(bank.value, 'rejected')}
                    >
                      Rejected
                    </button>
                    <button
                      onClick={() => handleStatusChange(bank.value, 'pending')}
                      className={getStatusButtonClass(bank.value, 'pending')}
                    >
                      Pending
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankStatusModal; 