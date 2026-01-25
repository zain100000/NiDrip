/**
 * @file Reviews.jsx
 * @module Screens/Reviews/Management
 * @description
 * The moderation dashboard for customer feedback and product ratings.
 * * **Key Features:**
 * - **Multi-Criteria Filter:** Utilizes `useMemo` to filter through reviews by text, username, or product title, preventing expensive re-renders.
 * - **Dynamic Anchoring:** Employs a `useRef` object map to track the physical position of action buttons, allowing the `PopOver` to position itself precisely relative to the clicked row.
 * - **Moderation Workflow:** Supports permanent removal of inappropriate content via a confirmed deletion process.
 * - **Rich Data Display:** Features a customized table with user avatars and localized date formatting.
 * * @requires react-redux
 * @requires react-hot-toast
 * @requires ../../redux/slices/review.slice
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import "./Reviews.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllReviews, deleteReview } from "../../redux/slices/review.slice";
import Loader from "../../utilities/loader/Loader.utility";
import InputField from "../../utilities/input-field/InputField.utility";
import PopOver from "../../utilities/pop-over/PopOver.utility";
import Modal from "../../utilities/modal/Modal.utlity";
import { toast } from "react-hot-toast";

const Reviews = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const reviews = useSelector((state) => state.reviews.allReviews);
  const loading = useSelector((state) => state.reviews.loading);

  const [search, setSearch] = useState("");
  const [activePopover, setActivePopover] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const actionButtonRefs = useRef({});

  useEffect(() => {
    if (user?.id) dispatch(getAllReviews());
  }, [dispatch, user?.id]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(
      (review) =>
        review.reviewText?.toLowerCase().includes(search.toLowerCase()) ||
        review?.user?.userName?.toLowerCase().includes(search.toLowerCase()) ||
        review?.product?.title?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [reviews, search]);

  const stats = {
    total: reviews.length,
  };

  const handleOpenDeleteModal = (review) => {
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    setDeleting(true);

    const result = await dispatch(deleteReview(selectedReview._id));

    if (deleteReview.fulfilled.match(result)) {
      toast.success(result.payload.message);
      setIsDeleteModalOpen(false);
      setSelectedReview(null);
    } else {
      toast.error(result.payload?.message || "Failed");
    }

    setDeleting(false);
  };

  const getActionItems = (review) => [
    {
      label: "Delete Review",
      icon: "fas fa-trash",
      type: "danger",
      action: () => handleOpenDeleteModal(review),
    },
  ];

  return (
    <section id="reviews">
      <div className="reviews-container">
        <div className="reviews-breadcrumb">
          <div className="reviews-header">
            <h1 className="reviews-title">Customer Reviews</h1>
            <p className="reviews-subtitle">Manage customer's reviews</p>
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
            <h3>Total Reviews</h3>
            <p>{stats.total}</p>
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
                    <th>Reviewer</th>
                    <th>Product</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReviews.map((review) => (
                    <tr key={review._id}>
                      <td>
                        <div className="reviewer-cell">
                          <img
                            src={review?.user?.profilePicture}
                            alt="user"
                            className="reviewer-avatar"
                          />
                          <span className="user-name">
                            {review?.user?.userName || "Anonymous"}
                          </span>
                        </div>
                      </td>

                      <td className="product-title">
                        {review?.product?.title}
                      </td>

                      <td className="comment-cell">
                        <p className="comment-text">{review.reviewText}</p>
                      </td>

                      <td>{new Date(review.createdAt).toLocaleDateString()}</td>

                      <td className="action-dots">
                        <div className="popover-anchor">
                          <button
                            ref={(el) =>
                              (actionButtonRefs.current[review._id] = el)
                            }
                            className="action-dots"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePopover(
                                activePopover === review._id
                                  ? null
                                  : review._id,
                              );
                            }}
                          >
                            <i className="fas fa-ellipsis-v"></i>
                          </button>
                          <PopOver
                            isOpen={activePopover === review._id}
                            onClose={() => setActivePopover(null)}
                            items={getActionItems(review)}
                            className="review-actions-popover"
                            anchorRef={{
                              current: actionButtonRefs.current[review._id],
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

            {!loading && filteredReviews.length === 0 && (
              <div className="no-review-state">
                <i className="fas fa-star no-review-icon"></i>
                <h3>Review Not Found</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Review?"
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
        Are you sure you want to permanently delete the review from{" "}
        <strong>{selectedReview?.user?.userName}</strong>?
      </Modal>
    </section>
  );
};

export default Reviews;
