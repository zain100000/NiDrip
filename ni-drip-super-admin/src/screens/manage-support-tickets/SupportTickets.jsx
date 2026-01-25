/**
 * @file Support.jsx
 * @module Screens/Support/Management
 * @description
 * The moderation dashboard for support tickets.
 * * **Key Features:**
 * - **Multi-Criteria Filter:** Utilizes `useMemo` to filter through tickets by text, username, or product title, preventing expensive re-renders.
 * - **Dynamic Anchoring:** Employs a `useRef` object map to track the physical position of action buttons, allowing the `PopOver` to position itself precisely relative to the clicked row.
 * - **Moderation Workflow:** Supports permanent removal of inappropriate content via a confirmed deletion process.
 * - **Rich Data Display:** Features a customized table with user avatars and localized date formatting.
 * * @requires react-redux
 * @requires react-hot-toast
 * @requires ../../redux/slices/review.slice
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import "./SupportTickets.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllTickets, deleteTicket } from "../../redux/slices/support.slice";
import Loader from "../../utilities/loader/Loader.utility";
import InputField from "../../utilities/input-field/InputField.utility";
import PopOver from "../../utilities/pop-over/PopOver.utility";
import Modal from "../../utilities/modal/Modal.utlity";
import { toast } from "react-hot-toast";

const SupportTicket = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const support = useSelector((state) => state.support.allTickets);
  const loading = useSelector((state) => state.support.loading);

  const [search, setSearch] = useState("");
  const [activePopover, setActivePopover] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  console.log("Ticketsss", support);

  const actionButtonRefs = useRef({});

  useEffect(() => {
    if (user?.id) dispatch(getAllTickets());
  }, [dispatch, user?.id]);

  const filteredTickets = useMemo(() => {
    return support.filter((support) =>
      support._id?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [support, search]);

  const stats = {
    total: support.length,
    open: support.filter((p) => p.status === "OPEN").length,
    in_progress: support.filter((p) => p.status === "IN_PROGRESS").length,
    resolved: support.filter((p) => p.status === "RESOLVED").length,
    closed: support.filter((p) => p.status === "CLOSED").length,
  };

  const handleOpenDeleteModal = (review) => {
    setSelectedTicket(review);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTicket) return;

    setDeleting(true);

    const result = await dispatch(deleteTicket(selectedTicket._id));

    if (deleteReview.fulfilled.match(result)) {
      toast.success(result.payload.message);
      setIsDeleteModalOpen(false);
      setSelectedTicket(null);
    } else {
      toast.error(result.payload?.message || "Failed");
    }

    setDeleting(false);
  };

  const getActionItems = (support) => [
    {
      label: "Change Ticket Status",
      icon: "fas fa-sync",
      // action: () => handleOpenDeleteModal(support),
    },

    {
      label: "Delete Ticket",
      icon: "fas fa-trash",
      type: "danger",
      action: () => handleOpenDeleteModal(support),
    },
  ];

  return (
    <section id="support-ticket">
      <div className="support-ticket-container">
        <div className="support-ticket-breadcrumb">
          <div className="support-ticket-header">
            <h1 className="support-ticket-title">Support Tickets</h1>
            <p className="support-subtitle">
              Manage customer's tickets and support requests
            </p>
          </div>

          <div className="search-wrapper">
            <InputField
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              width={350}
              icon={<i className="fas fa-search"></i>}
            />
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Tickets</h3>
            <p>{stats.total}</p>
          </div>

          <div className="stat-card">
            <h3>Open</h3>
            <p>{stats.open}</p>
          </div>

          <div className="stat-card">
            <h3>InProgress</h3>
            <p>{stats.in_progress}</p>
          </div>

          <div className="stat-card">
            <h3>Resolved</h3>
            <p>{stats.resolved}</p>
          </div>

          <div className="stat-card">
            <h3>Closed</h3>
            <p>{stats.closed}</p>
          </div>
        </div>

        <div className="table-card">
          <div className="table-responsive">
            {loading ? (
              <div className="loader-container">
                <Loader />
              </div>
            ) : (
              <table className="table custom-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Customer</th>
                    <th>Subject</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map((support) => (
                    <tr key={support._id}>
                      <td>
                        <div className="support-info">
                          <span className="sku">
                            #{support._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="customer-cell">
                          <span className="user-name">
                            {support?.user?.userName || "Customer"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="subject-cell">
                          <span className="subject">
                            {support?.subject || "Ticket Subject"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="reason-cell">
                          <span className="reason">
                            {support?.description || "Ticket Reason"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            support.status === "OPEN"
                              ? "open"
                              : support.status === "IN_PROGRESS"
                                ? "in-progress"
                                : support.status === "RESOLVED"
                                  ? "resolved"
                                  : support.status === "CLOSED"
                                    ? "closed"
                                    : "inactive"
                          }`}
                        >
                          {support.status === "OPEN"
                            ? "Open"
                            : support.status === "IN_PROGRESS"
                              ? "In Progress"
                              : support.status === "RESOLVED"
                                ? "Resolved"
                                : support.status === "CLOSED"
                                  ? "Closed"
                                  : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`priority-badge ${
                            support.priority === "LOW"
                              ? "low"
                              : support.priority === "MEDIUM"
                                ? "medium"
                                : support.priority === "HIGH"
                                  ? "high"
                                  : "N/A"
                          }`}
                        >
                          {support.priority === "LOW"
                            ? "LOW"
                            : support.priority === "MEDIUM"
                              ? "MEDIUM"
                              : support.priority === "HIGH"
                                ? "HIGH"
                                : "N/A"}
                        </span>
                      </td>

                      <td>
                        {new Date(support.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>

                      <td className="action-dots">
                        <div className="popover-anchor">
                          <button
                            ref={(el) =>
                              (actionButtonRefs.current[support._id] = el)
                            }
                            className="action-dots"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePopover(
                                activePopover === support._id
                                  ? null
                                  : support._id,
                              );
                            }}
                          >
                            <i className="fas fa-ellipsis-v" style={{marginLeft: 25}}></i>
                          </button>
                          <PopOver
                            isOpen={activePopover === support._id}
                            onClose={() => setActivePopover(null)}
                            items={getActionItems(support)}
                            className="support-actions-popover"
                            anchorRef={{
                              current: actionButtonRefs.current[support._id],
                            }}
                            position="bottom"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

             {!loading && filteredTickets.length === 0 && (
              <div className="no-ticket-state">
                <i className="fas fa-ticket-alt no-ticket-icon"></i>
                <h3>Ticket Not Found</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Ticket?"
        buttons={[
          {
            label: "Cancel",
            className: "cancel-btn",
            onClick: () => setIsDeleteModalOpen(false),
          },
          {
            label: "Delete",
            className: "danger-btn",
            onClick: handleDelete,
            loading: deleting,
          },
        ]}
      >
        Are you sure you want to permanently delete the {""}
        {""} ticket #
        <strong>{selectedTicket?._id.slice(-6).toUpperCase()}</strong>
      </Modal>
    </section>
  );
};

export default SupportTicket;
