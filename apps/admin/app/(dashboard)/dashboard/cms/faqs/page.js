"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Switch from "@/components/ui/Switch";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  useFetchFaqsQuery,
  useAddFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} from "@/store/slices/cmsApi";

export default function CmsFaqsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useFetchFaqsQuery(true);
  const [addFaq, { isLoading: isAdding }] = useAddFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [faqToDelete, setFaqToDelete] = useState(null);

  const faqs = data?.faqs || [];

  const filteredFaqs = faqs.filter((f) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      f.question?.toLowerCase().includes(q) ||
      f.questionBn?.toLowerCase().includes(q) ||
      f.answer?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async () => {
    if (!faqToDelete) return;
    try {
      await deleteFaq(faqToDelete._id).unwrap();
      toast.success("FAQ removed successfully");
      setFaqToDelete(null);
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to delete FAQ");
    }
  };

  const handleToggleStatus = async (faq, active) => {
    try {
      await updateFaq({
        id: faq._id,
        status: active ? "active" : "inactive",
      }).unwrap();
      toast.success(`FAQ marked as ${active ? "active" : "inactive"}`);
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to update status");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-primary" />
            Frequently Asked Questions (FAQs)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer help questions and answers displayed on the FAQ page and product tabs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RotateCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSelectedFaq(null);
              setIsModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add FAQ
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          placeholder="Search FAQs by question or answer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
        />
      </div>

      {/* FAQs List */}
      <Card>
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-base font-bold text-foreground">
            Questions ({filteredFaqs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Failed to load FAQs: {error?.data?.error || error?.message || "Unknown error"}
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={HelpCircle}
                title="No FAQs found"
                description={
                  searchTerm
                    ? `No questions matched "${searchTerm}".`
                    : "Create your first FAQ to answer common customer inquiries."
                }
                action={
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedFaq(null);
                      setIsModalOpen(true);
                    }}
                  >
                    Add First FAQ
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredFaqs.map((faq) => {
                const isActive = faq.status === "active";
                return (
                  <div
                    key={faq._id}
                    className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="font-bold text-foreground text-sm flex items-center gap-2">
                        <span>{faq.question}</span>
                        {faq.questionBn && (
                          <span className="text-xs font-normal text-muted-foreground">
                            ({faq.questionBn})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {faq.answer}
                      </p>
                      {faq.answerBn && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-1 italic">
                          বাংলা: {faq.answerBn}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <Switch
                        checked={isActive}
                        onChange={(checked) => handleToggleStatus(faq, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFaq(faq);
                          setIsModalOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFaqToDelete(faq)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit FAQ Modal */}
      {isModalOpen && (
        <FaqModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          faq={selectedFaq}
          onSaved={() => {
            setIsModalOpen(false);
            refetch();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(faqToDelete)}
        onClose={() => setFaqToDelete(null)}
        onConfirm={handleDelete}
        title="Delete FAQ"
        description={`Are you sure you want to delete this FAQ: "${faqToDelete?.question}"?`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </div>
  );
}

function FaqModal({ isOpen, onClose, faq, onSaved }) {
  const isEdit = Boolean(faq?._id);
  const [addFaq, { isLoading: isAdding }] = useAddFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const isLoading = isAdding || isUpdating;

  const [question, setQuestion] = useState(faq?.question || "");
  const [questionBn, setQuestionBn] = useState(faq?.questionBn || "");
  const [answer, setAnswer] = useState(faq?.answer || "");
  const [answerBn, setAnswerBn] = useState(faq?.answerBn || "");
  const [order, setOrder] = useState(faq?.order ?? 0);
  const [status, setStatus] = useState(faq?.status || "active");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }

    const payload = {
      question: question.trim(),
      questionBn: questionBn.trim(),
      answer: answer.trim(),
      answerBn: answerBn.trim(),
      order: Number(order) || 0,
      status,
    };

    try {
      if (isEdit) {
        await updateFaq({ id: faq._id, ...payload }).unwrap();
        toast.success("FAQ updated successfully");
      } else {
        await addFaq(payload).unwrap();
        toast.success("FAQ created successfully");
      }
      onSaved();
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to save FAQ");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit FAQ" : "Add FAQ"}
      description="Enter question and detailed answer in English and Bangla."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Question (English)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. How long does medicine delivery take?"
          required
        />
        <Input
          label="Question (Bangla)"
          value={questionBn}
          onChange={(e) => setQuestionBn(e.target.value)}
          placeholder="e.g. ওষুধ ডেলিভারি পেতে কতক্ষণ সময় লাগে?"
        />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Answer (English)
          </label>
          <textarea
            rows={3}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Detailed answer text..."
            className="w-full text-xs p-3 rounded-md border border-input bg-card text-foreground"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Answer (Bangla)
          </label>
          <textarea
            rows={3}
            value={answerBn}
            onChange={(e) => setAnswerBn(e.target.value)}
            placeholder="বাংলা উত্তর..."
            className="w-full text-xs p-3 rounded-md border border-input bg-card text-foreground"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 items-center">
          <Input
            label="Display Order"
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />
          <div className="pt-5">
            <Switch
              label="Active Status"
              checked={status === "active"}
              onChange={(checked) => setStatus(checked ? "active" : "inactive")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? "Update FAQ" : "Save FAQ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
