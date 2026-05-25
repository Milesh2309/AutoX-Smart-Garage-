import React, { useEffect, useMemo, useState } from 'react';
import { useBilling } from '../../context/BillingContext';
import { downloadInvoicePDF } from '../../utils/invoiceGenerator';
import CommonTable from '../../components/CommonTable';
import './ManageBilling.css';

const emptyLineItem = () => ({ name: '', quantity: 1, price: 0, itemType: 'service' });

const emptyForm = {
  customerType: 'registered',
  userId: '',
  customerDetails: { name: '', phone: '', email: '' },
  vehicleDetails: { number: '', model: '', company: '' },
  lineItems: [emptyLineItem()],
  serviceCharge: 0,
  discount: 0,
  gst: 0,
  currency: 'INR',
  paymentMethod: 'cash',
  status: 'issued',
};

function ManageBilling() {
  const {
    billingRecords,
    fetchAllBillingRecords,
    createBillingRecord,
    updateBillingRecord,
    fetchRegisteredCustomers,
    fetchRegisteredCustomerProfile,
    loading,
  } = useBilling();

  const [activeTab, setActiveTab] = useState('create');
  const [editingInvoice, setEditingInvoice] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [registeredCustomers, setRegisteredCustomers] = useState([]);
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await fetchAllBillingRecords();
      } catch (_error) {
        setRegisteredCustomers([]);
      }

      try {
        const customers = await fetchRegisteredCustomers();
        setRegisteredCustomers(customers);
      } catch (_error) {
        setRegisteredCustomers([]);
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const lineTotal = formData.lineItems.reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      return sum + quantity * price;
    }, 0);

    const serviceCharge = Number(formData.serviceCharge || 0);
    const discount = Number(formData.discount || 0);
    const gst = Number(formData.gst || 0);
    const subtotal = Math.max(0, lineTotal + serviceCharge - discount);
    const finalTotal = Math.max(0, subtotal + gst);

    return { lineTotal, subtotal, finalTotal };
  }, [formData]);

  const billingColumns = useMemo(
    () => [
      { accessorKey: 'invoiceNumber', header: 'Invoice #', size: 140 },
      {
        accessorKey: 'customerDetails.name',
        header: 'Customer',
        cell: ({ row }) => row.original?.customerDetails?.name || '—',
      },
      {
        accessorKey: 'vehicleDetails.number',
        header: 'Vehicle Number',
        cell: ({ row }) => row.original?.vehicleDetails?.number || '—',
      },
      {
        accessorKey: 'customerType',
        header: 'Type',
        cell: ({ getValue }) => (getValue() === 'offline' ? 'Offline' : 'Registered'),
      },
      {
        accessorKey: 'finalTotal',
        header: 'Final Total',
        cell: ({ row }) => `₹${Number(row.original?.finalTotal || row.original?.totalAmount || 0).toFixed(2)}`,
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('en-IN'),
      },
    ],
    []
  );

  const filteredBillings = useMemo(() => {
    return billingRecords.filter((record) => {
      const text = searchTerm.trim().toLowerCase();
      const customerName = String(record?.customerDetails?.name || '').toLowerCase();
      const vehicleNumber = String(record?.vehicleDetails?.number || '').toLowerCase();
      const matchesText =
        !text ||
        customerName.includes(text) ||
        vehicleNumber.includes(text) ||
        String(record?.invoiceNumber || '').toLowerCase().includes(text);

      if (!matchesText) return false;

      if (!searchDate) return true;
      const billDate = new Date(record?.createdAt || record?.paymentDate);
      const selectedDate = new Date(searchDate);
      return (
        billDate.getFullYear() === selectedDate.getFullYear() &&
        billDate.getMonth() === selectedDate.getMonth() &&
        billDate.getDate() === selectedDate.getDate()
      );
    });
  }, [billingRecords, searchDate, searchTerm]);

  const handleCustomerTypeChange = (customerType) => {
    setFormData((prev) => ({
      ...prev,
      customerType,
      userId: '',
      customerDetails: { name: '', phone: '', email: '' },
      vehicleDetails: { number: '', model: '', company: '' },
    }));
    setCustomerVehicles([]);
  };

  const handleRegisteredCustomerSelect = async (userId) => {
    if (!userId) return;
    const profile = await fetchRegisteredCustomerProfile(userId);
    if (!profile) return;

    setCustomerVehicles(profile.vehicles || []);
    setFormData((prev) => ({
      ...prev,
      userId: profile.userId || userId,
      customerDetails: profile.customerDetails || { name: '', phone: '', email: '' },
      vehicleDetails: profile.vehicleDetails || { number: '', model: '', company: '' },
    }));
  };

  const handleVehiclePick = (vehicleNumber) => {
    const found = customerVehicles.find((vehicle) => vehicle.number === vehicleNumber);
    if (!found) return;

    setFormData((prev) => ({
      ...prev,
      vehicleDetails: {
        number: found.number || '',
        model: found.model || '',
        company: found.company || '',
      },
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item, idx) =>
        idx === index ? { ...item, [field]: field === 'name' || field === 'itemType' ? value : Number(value || 0) } : item
      ),
    }));
  };

  const addLineItem = () => {
    setFormData((prev) => ({ ...prev, lineItems: [...prev.lineItems, emptyLineItem()] }));
  };

  const removeLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.length <= 1 ? prev.lineItems : prev.lineItems.filter((_, idx) => idx !== index),
    }));
  };

  const mapInvoiceToForm = (invoice) => ({
    customerType: invoice.customerType || 'registered',
    userId: invoice.userId || '',
    customerDetails: {
      name: invoice.customerDetails?.name || '',
      phone: invoice.customerDetails?.phone || '',
      email: invoice.customerDetails?.email || '',
    },
    vehicleDetails: {
      number: invoice.vehicleDetails?.number || '',
      model: invoice.vehicleDetails?.model || '',
      company: invoice.vehicleDetails?.company || '',
    },
    lineItems: Array.isArray(invoice.lineItems) && invoice.lineItems.length
      ? invoice.lineItems.map((item) => ({
          name: item.name || '',
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
          itemType: item.itemType || 'service',
        }))
      : [emptyLineItem()],
    serviceCharge: Number(invoice.serviceCharge || 0),
    discount: Number(invoice.discount || 0),
    gst: Number(invoice.gst || 0),
    currency: invoice.currency || 'INR',
    paymentMethod: invoice.paymentMethod || 'cash',
    status: invoice.status || 'issued',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      lineItems: formData.lineItems.filter((item) => item.name.trim()),
      subtotal: totals.subtotal,
      finalTotal: totals.finalTotal,
    };

    if (!payload.lineItems.length) {
      alert('Please add at least one service or part item.');
      return;
    }

    if (payload.customerType === 'registered' && !payload.userId) {
      alert('Please select a registered user.');
      return;
    }

    if (payload.customerType === 'offline' && (!payload.customerDetails.name || !payload.customerDetails.phone)) {
      alert('Please enter offline customer name and mobile number.');
      return;
    }

    if (!payload.vehicleDetails.number) {
      alert('Please enter/select vehicle number.');
      return;
    }

    try {
      if (editingInvoice) {
        await updateBillingRecord(editingInvoice, payload);
        alert('Bill updated successfully.');
      } else {
        await createBillingRecord(payload);
        alert('Bill created successfully.');
      }

      setEditingInvoice('');
      setFormData(emptyForm);
      setCustomerVehicles([]);
      await fetchAllBillingRecords();
      setActiveTab('records');
    } catch (error) {
      alert(error.message || 'Unable to save bill.');
    }
  };

  const handleEditBill = async (record) => {
    setEditingInvoice(record.invoiceNumber);
    setFormData(mapInvoiceToForm(record));

    if (record.customerType === 'registered' && record.userId) {
      const profile = await fetchRegisteredCustomerProfile(record.userId);
      setCustomerVehicles(profile?.vehicles || []);
    } else {
      setCustomerVehicles([]);
    }

    setActiveTab('create');
  };

  const handleDownloadInvoice = (record) => {
    downloadInvoicePDF(record, {
      name: record?.customerDetails?.name || 'Customer',
      email: record?.customerDetails?.email || 'N/A',
      phone: record?.customerDetails?.phone || 'N/A',
      address: 'N/A',
      vehicleNumber: record?.vehicleDetails?.number || 'N/A',
      vehicleModel: record?.vehicleDetails?.model || 'N/A',
      vehicleCompany: record?.vehicleDetails?.company || 'N/A',
    });
  };

  const handleShareInvoice = async (record) => {
    const invoiceNumber = record?.invoiceNumber || 'N/A';
    const customerName = record?.customerDetails?.name || 'Customer';
    const vehicleNumber = record?.vehicleDetails?.number || 'N/A';
    const totalAmount = Number(record?.finalTotal || record?.totalAmount || 0).toFixed(2);
    const invoiceDate = record?.createdAt
      ? new Date(record.createdAt).toLocaleDateString('en-IN')
      : 'N/A';

    const shareText = [
      `Invoice: ${invoiceNumber}`,
      `Customer: ${customerName}`,
      `Vehicle: ${vehicleNumber}`,
      `Amount: INR ${totalAmount}`,
      `Date: ${invoiceDate}`,
    ].join('\n');

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Invoice ${invoiceNumber}`,
          text: shareText,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        alert('Invoice details copied to clipboard.');
        return;
      }

      alert('Sharing is not supported on this browser.');
    } catch (error) {
      if (error?.name !== 'AbortError') {
        alert('Unable to share invoice right now.');
      }
    }
  };

  return (
    <div className="manage-billing">
      <div className="billing-page-header">
        <h1>Billing Management</h1>
        <p>Create, edit, view, search, and download professional invoices.</p>
      </div>

      <div className="billing-tabs">
        <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
          Create New Bill
        </button>
        <button className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>
          Billing Records
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'create' && (
          <form className="billing-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Select Customer Type</label>
                <select
                  className="billing-select customer-type-select"
                  value={formData.customerType}
                  onChange={(e) => handleCustomerTypeChange(e.target.value)}
                >
                  <option value="registered">Registered User</option>
                  <option value="offline">Offline Customer (Walk-in)</option>
                </select>
              </div>

              {formData.customerType === 'registered' ? (
                <>
                  <div className="form-group">
                    <label>Registered User</label>
                    <select
                      className="billing-select registered-user-select"
                      value={formData.userId}
                      onChange={(e) => handleRegisteredCustomerSelect(e.target.value)}
                    >
                      <option value="">Select customer</option>
                      {registeredCustomers.map((user) => (
                        <option key={user.id} value={user.userId || user.id}>
                          {user.name} {user.phone ? `(${user.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Customer Name</label>
                    <input type="text" value={formData.customerDetails.name} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input type="text" value={formData.customerDetails.phone} readOnly />
                  </div>

                  <div className="form-group">
                    <label>Vehicle Number</label>
                    <select
                      className="billing-select vehicle-number-select"
                      value={formData.vehicleDetails.number}
                      onChange={(e) => handleVehiclePick(e.target.value)}
                    >
                      <option value="">Select vehicle</option>
                      {customerVehicles.map((vehicle) => (
                        <option key={`${vehicle.number}-${vehicle.id || ''}`} value={vehicle.number}>
                          {vehicle.number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Vehicle Model</label>
                    <input type="text" value={formData.vehicleDetails.model} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Company</label>
                    <input type="text" value={formData.vehicleDetails.company} readOnly />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input
                      type="text"
                      value={formData.customerDetails.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerDetails: { ...prev.customerDetails, name: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="text"
                      value={formData.customerDetails.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerDetails: { ...prev.customerDetails, phone: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Number</label>
                    <input
                      type="text"
                      value={formData.vehicleDetails.number}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicleDetails: { ...prev.vehicleDetails, number: e.target.value.toUpperCase() },
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Model</label>
                    <input
                      type="text"
                      value={formData.vehicleDetails.model}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicleDetails: { ...prev.vehicleDetails, model: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Company</label>
                    <input
                      type="text"
                      value={formData.vehicleDetails.company}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicleDetails: { ...prev.vehicleDetails, company: e.target.value },
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <h3 className="section-title">Service & Parts Details</h3>
            <div className="line-items-table">
              <div className="line-items-header">
                <span>Service/Part Name</span>
                <span>Quantity</span>
                <span>Price</span>
                <span>Total</span>
                <span>Action</span>
              </div>
              {formData.lineItems.map((item, index) => (
                <div key={`line-item-${index}`} className="line-item-row">
                  <input
                    type="text"
                    value={item.name}
                    placeholder="Enter service or part name"
                    onChange={(e) => handleLineItemChange(index, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    value={item.price}
                    onChange={(e) => handleLineItemChange(index, 'price', e.target.value)}
                  />
                  <input type="text" value={`₹${(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}`} readOnly />
                  <button type="button" className="btn-danger" onClick={() => removeLineItem(index)}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={addLineItem}>
                + Add Row
              </button>
            </div>

            <h3 className="section-title">Additional Billing Fields</h3>
            <div className="form-grid compact-grid">
              <div className="form-group">
                <label>Service Charge</label>
                <input
                  type="number"
                  min="0"
                  value={formData.serviceCharge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, serviceCharge: Number(e.target.value || 0) }))}
                />
              </div>
              <div className="form-group">
                <label>Discount</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, discount: Number(e.target.value || 0) }))}
                />
              </div>
              <div className="form-group">
                <label>GST</label>
                <input
                  type="number"
                  min="0"
                  value={formData.gst}
                  onChange={(e) => setFormData((prev) => ({ ...prev, gst: Number(e.target.value || 0) }))}
                />
              </div>
              <div className="form-group">
                <label>Final Total</label>
                <input type="text" value={`₹${totals.finalTotal.toFixed(2)}`} readOnly />
              </div>
            </div>

            <div className="summary-box">
              <div><span>Line Items:</span><strong>₹{totals.lineTotal.toFixed(2)}</strong></div>
              <div><span>Subtotal:</span><strong>₹{totals.subtotal.toFixed(2)}</strong></div>
              <div><span>Final Total:</span><strong>₹{totals.finalTotal.toFixed(2)}</strong></div>
            </div>

            <div className="form-actions">
              {editingInvoice ? (
                <button type="button" className="btn-secondary" onClick={() => {
                  setEditingInvoice('');
                  setFormData(emptyForm);
                  setCustomerVehicles([]);
                }}>
                  Cancel Edit
                </button>
              ) : null}
              <button type="submit" className="btn-primary">
                {editingInvoice ? 'Update Bill' : 'Save Bill'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'records' && (
          <>
            <div className="billing-filters-section">
              <div className="filter-box">
                <label>Search (Customer / Vehicle / Invoice)</label>
                <input
                  type="text"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-box">
                <label>Date</label>
                <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
              </div>
            </div>

            {loading ? (
              <div className="loading-state"><p>Loading billing records...</p></div>
            ) : (
              <>
                <div className="table-wrapper">
                  <CommonTable data={filteredBillings} columns={billingColumns} />
                </div>
                <div className="billing-actions-grid">
                  {filteredBillings.map((record) => (
                    <div key={record.invoiceNumber} className="action-row">
                      <span className="invoice-ref">{record.invoiceNumber}</span>
                      <div className="action-buttons">
                        <button className="btn-action btn-view" onClick={() => setSelectedInvoice(record)}>View</button>
                        <button className="btn-action btn-edit" onClick={() => handleEditBill(record)}>Edit</button>
                        <button className="btn-action btn-download" onClick={() => handleDownloadInvoice(record)}>PDF</button>
                        <button className="btn-action btn-share" onClick={() => handleShareInvoice(record)}>Share</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedInvoice(null)}>✕</button>
            <h3>Invoice {selectedInvoice.invoiceNumber}</h3>
            <p>
              <strong>Customer:</strong> {selectedInvoice.customerDetails?.name || '—'}<br />
              <strong>Mobile:</strong> {selectedInvoice.customerDetails?.phone || '—'}<br />
              <strong>Vehicle:</strong> {selectedInvoice.vehicleDetails?.number || '—'} ({selectedInvoice.vehicleDetails?.company || '—'} {selectedInvoice.vehicleDetails?.model || ''})
            </p>
            <div className="mini-table">
              {(selectedInvoice.lineItems || []).map((item, index) => (
                <div key={`${item.name}-${index}`} className="mini-row">
                  <span>{item.name}</span>
                  <span>{item.quantity} × ₹{item.price}</span>
                  <strong>₹{item.total}</strong>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => handleDownloadInvoice(selectedInvoice)}>Download PDF</button>
              <button className="btn-primary" onClick={() => handleShareInvoice(selectedInvoice)}>Share Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBilling;
