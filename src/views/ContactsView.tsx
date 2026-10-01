import React, { useState } from 'react';
import {
  Heart,
  Plus,
  Trash2,
  Edit2,
  Phone,
  ShieldAlert,
  Sparkles,
  PhoneForwarded,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { ImportantContact, ContactPriority } from '../types';

export const ContactsView: React.FC = () => {
  const { contacts, addContact, updateContact, deleteContact, simulateIncomingCall } = useAssistant();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Papa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [priority, setPriority] = useState<ContactPriority>('Very Important');
  const [incomingAction, setIncomingAction] = useState<ImportantContact['incomingAction']>('special_banner');
  const [unansweredAction, setUnansweredAction] = useState<ImportantContact['unansweredAction']>('voice_reply');
  const [forwardingNumber, setForwardingNumber] = useState('');
  const [isSpecialRule, setIsSpecialRule] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) return;

    addContact({
      name: name.trim(),
      relation,
      phoneNumber: phoneNumber.trim(),
      priority,
      incomingAction,
      unansweredAction,
      forwardingNumber: forwardingNumber.trim() || undefined,
      isSpecialRule: isSpecialRule || name.toLowerCase().includes('papa'),
    });

    setName('');
    setPhoneNumber('');
    setForwardingNumber('');
    setIsSpecialRule(false);
    setShowAddModal(false);
  };

  const papaContact = contacts.find((c) => c.isSpecialRule || c.name.toLowerCase().includes('papa'));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500/20" />
            <span>Important Contacts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Priority call rules, automated answering preferences and Papa special rule.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Special Rule for Papa Banner */}
      {papaContact && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/40 border-2 border-rose-500/40 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/40">
                <Heart className="w-7 h-7 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Highest Priority Contact
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Special Papa Rule Active
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {papaContact.name} ({papaContact.phoneNumber})
                </h2>
              </div>
            </div>

            <button
              onClick={() => simulateIncomingCall(papaContact.id)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 active:scale-95 transition"
            >
              <Phone className="w-4 h-4" />
              <span>Test "❤️ Papa is calling" Rule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-rose-900/50 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-rose-500/20">
              <span className="font-bold text-rose-300 block mb-0.5">Incoming Alert</span>
              Prominent "❤️ Papa is calling" banner with [Answer], [Reject], [Forward]
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-rose-500/20">
              <span className="font-bold text-rose-300 block mb-0.5">20s Unanswered Rule</span>
              Lakshmi auto-answers: "Namaste, Ritesh abhi phone nahi utha pa rahe hain. Aap batayein, kya kaam hai?"
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-rose-500/20">
              <span className="font-bold text-rose-300 block mb-0.5">Message Capture</span>
              Saves Papa's voice message & immediately notifies Ritesh with [Call Back]
            </div>
          </div>
        </div>
      )}

      {/* All Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-md space-y-4 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    contact.priority === 'Emergency'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : contact.priority === 'Very Important'
                      ? 'bg-pink-600 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {contact.relation === 'Papa' ? '❤️' : contact.name.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{contact.name}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        contact.priority === 'Emergency'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : contact.priority === 'Very Important'
                          ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {contact.priority}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {contact.phoneNumber} ({contact.relation})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => simulateIncomingCall(contact.id)}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition"
                  title="Simulate call from this contact"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteContact(contact.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  title="Delete contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Configured Rules */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-500 block">Incoming Call:</span>
                <span className="font-semibold capitalize text-slate-200">
                  {contact.incomingAction.replace('_', ' ')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-500 block">Unanswered:</span>
                <span className="font-semibold capitalize text-slate-200">
                  {contact.unansweredAction.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add Important Contact</h3>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Contact Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Papa, Mummy, Aman"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Relation</label>
                  <input
                    type="text"
                    required
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    placeholder="e.g. Papa, Friend"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ContactPriority)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Important">Important</option>
                  <option value="Very Important">Very Important</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Incoming Action</label>
                  <select
                    value={incomingAction}
                    onChange={(e) => setIncomingAction(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="special_banner">Special Banner</option>
                    <option value="ring_loudly">Ring Loudly</option>
                    <option value="auto_forward">Auto Forward</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Unanswered Action</label>
                  <select
                    value={unansweredAction}
                    onChange={(e) => setUnansweredAction(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="voice_reply">Voice Reply (Kya Kaam Hai)</option>
                    <option value="record_message">Record Message</option>
                    <option value="sms_alert">SMS Alert</option>
                    <option value="standard">Standard Missed Call</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
