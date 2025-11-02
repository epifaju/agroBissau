'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface Question {
  id: string;
  content: string;
  createdAt: string;
  asker: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  answer?: {
    id: string;
    content: string;
    createdAt: string;
    answerer: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

interface QuestionsSectionProps {
  listingId: string;
  listingOwnerId: string;
  listingTitle: string;
}

export function QuestionsSection({
  listingId,
  listingOwnerId,
  listingTitle,
}: QuestionsSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isListingOwner = user && (user as any)?.id === listingOwnerId;

  useEffect(() => {
    if (listingId) {
      fetchQuestions();
    }
  }, [listingId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${listingId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      } else {
        console.error('Error fetching questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/listings/${listingId}`;
      return;
    }

    if (newQuestion.trim().length < 5) {
      setError('La question doit contenir au moins 5 caractères');
      return;
    }

    if (newQuestion.trim().length > 500) {
      setError('La question ne peut pas dépasser 500 caractères');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/${listingId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newQuestion.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewQuestion('');
        // Recharger les questions
        await fetchQuestions();
      } else {
        setError(data.error || 'Erreur lors de la création de la question');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      setError('Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnswer = async (questionId: string, answerContent: string) => {
    if (answerContent.trim().length < 5) {
      alert('La réponse doit contenir au moins 5 caractères');
      return;
    }

    if (answerContent.trim().length > 1000) {
      alert('La réponse ne peut pas dépasser 1000 caractères');
      return;
    }

    try {
      const response = await fetch(`/api/questions/${questionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: answerContent.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        // Recharger les questions
        await fetchQuestions();
      } else {
        alert(data.error || 'Erreur lors de la création de la réponse');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Une erreur est survenue');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Chargement des questions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Questions et Réponses
          {questions.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {questions.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Formulaire pour poser une question */}
        {isAuthenticated && !isListingOwner && (
          <form onSubmit={handleSubmitQuestion} className="mb-6">
            <div className="space-y-2">
              <Textarea
                placeholder="Posez une question au vendeur..."
                value={newQuestion}
                onChange={(e) => {
                  setNewQuestion(e.target.value);
                  setError(null);
                }}
                rows={3}
                maxLength={500}
                required
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {newQuestion.length}/500 caractères
                </p>
                {error && (
                  <p className="text-xs text-red-600">{error}</p>
                )}
              </div>
              <Button type="submit" disabled={submitting || newQuestion.trim().length < 5}>
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Envoi...' : 'Poser la question'}
              </Button>
            </div>
          </form>
        )}

        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">
              Connectez-vous pour poser une question au vendeur
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = `/login?redirect=/listings/${listingId}`;
              }}
            >
              Se connecter
            </Button>
          </div>
        )}

        {isListingOwner && questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune question pour le moment
          </div>
        )}

        {/* Liste des questions */}
        {questions.length === 0 && !isListingOwner && !isAuthenticated && (
          <div className="text-center py-8 text-gray-500">
            Aucune question pour le moment. Soyez le premier à poser une question !
          </div>
        )}

        {questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                {/* Question */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={question.asker.avatar} />
                      <AvatarFallback>
                        {getInitials(question.asker.firstName, question.asker.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">
                          {question.asker.firstName} {question.asker.lastName}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(question.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{question.content}</p>
                    </div>
                    {!question.answer && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        En attente
                      </Badge>
                    )}
                    {question.answer && (
                      <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Répondu
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Réponse */}
                {question.answer ? (
                  <div className="ml-11 pl-4 border-l-2 border-green-200 bg-green-50 rounded-r-lg p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={question.answer.answerer.avatar} />
                        <AvatarFallback>
                          {getInitials(
                            question.answer.answerer.firstName,
                            question.answer.answerer.lastName
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-green-700">
                            {question.answer.answerer.firstName} {question.answer.answerer.lastName}
                          </p>
                          <span className="text-xs text-gray-500">Vendeur</span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(question.answer.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{question.answer.content}</p>
                      </div>
                    </div>
                  </div>
                ) : isListingOwner ? (
                  <AnswerForm
                    questionId={question.id}
                    onSubmit={(answerContent) => handleSubmitAnswer(question.id, answerContent)}
                  />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Composant pour le formulaire de réponse (pour le vendeur)
interface AnswerFormProps {
  questionId: string;
  onSubmit: (content: string) => void;
}

function AnswerForm({ questionId, onSubmit }: AnswerFormProps) {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (answer.trim().length < 5) {
      alert('La réponse doit contenir au moins 5 caractères');
      return;
    }

    if (answer.trim().length > 1000) {
      alert('La réponse ne peut pas dépasser 1000 caractères');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(answer);
      setAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ml-11">
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <Textarea
          placeholder="Répondez à cette question..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          maxLength={1000}
          required
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{answer.length}/1000 caractères</p>
          <Button type="submit" size="sm" disabled={submitting || answer.trim().length < 5}>
            <Send className="w-3 h-3 mr-2" />
            {submitting ? 'Envoi...' : 'Répondre'}
          </Button>
        </div>
      </div>
    </form>
  );
}

