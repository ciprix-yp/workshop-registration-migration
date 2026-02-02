'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RegistrationFormData } from '@/types/workshop';

/**
 * Workshop Registration Page
 * Dynamic route: /[workshopSlug]/registration
 *
 * 3-Step Registration Flow:
 * Step 1: Email + Member Check
 * Step 2: Personal Details
 * Step 3: Payment + Invoice
 */

// Zod validation schema
const registrationSchema = z.object({
  // Step 1
  email: z.string().email('Email invalid'),

  // Step 2
  prenume: z.string().min(2, 'Prenume este necesar'),
  nume: z.string().min(2, 'Nume este necesar'),
  telefon: z.string().min(10, 'Telefon invalid'),
  provocare: z.string().min(10, 'Descrie provocarea (minim 10 caractere)'),
  rezultat: z.string().min(10, 'Descrie rezultatul dorit (minim 10 caractere)'),
  nivel: z.string().min(1, 'Selectează nivelul'),

  // Step 3
  invoiceType: z.enum(['PJ', 'PF']),
  companieFirma: z.string().optional(),
  cui: z.string().optional(),
  gdprConsent: z.boolean().refine(val => val === true, 'Consimțământul GDPR este obligatoriu'),
  marketingConsent: z.boolean(),
});

export default function RegistrationPage({
  params,
}: {
  params: { workshopSlug: string };
}) {
  const [step, setStep] = useState(1);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      invoiceType: 'PF',
      gdprConsent: false,
      marketingConsent: false,
    },
  });

  const watchEmail = watch('email');
  const watchInvoiceType = watch('invoiceType');

  // Step 1: Check member status
  const handleCheckEmail = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/check-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: watchEmail,
          workshopSlug: params.workshopSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Eroare la verificare');
        return;
      }

      setIsMember(data.isMember);
      setStep(2);
    } catch (err) {
      setError('Eroare de conexiune. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit registration
  const onSubmit = async (data: RegistrationFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/submit-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopSlug: params.workshopSlug,
          formData: data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Eroare la înregistrare');
        return;
      }

      // Redirect to payment
      window.location.href = result.paymentLink;
    } catch (err) {
      setError('Eroare de conexiune. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Înregistrare Workshop
        </h1>
        <p className="text-gray-600 mb-8">
          Completează formularul pentru a participa la workshop
        </p>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-24 h-1 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Email */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemplu.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleCheckEmail}
                disabled={loading || !watchEmail}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Verificare...' : 'Continuă'}
              </button>
            </div>
          )}

          {/* Step 2: Personal Details */}
          {step === 2 && (
            <div className="space-y-4">
              {isMember !== null && (
                <div
                  className={`px-4 py-3 rounded-lg ${
                    isMember ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'
                  }`}
                >
                  {isMember
                    ? '🎉 Bun venit înapoi! Ești membru BIZZ.CLUB.'
                    : '👋 Bun venit! Continuă cu înregistrarea.'}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prenume *
                  </label>
                  <input
                    {...register('prenume')}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.prenume && (
                    <p className="text-red-500 text-sm mt-1">{errors.prenume.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume *
                  </label>
                  <input
                    {...register('nume')}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.nume && (
                    <p className="text-red-500 text-sm mt-1">{errors.nume.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  {...register('telefon')}
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+40 724 123 456"
                />
                {errors.telefon && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefon.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provocare *
                </label>
                <textarea
                  {...register('provocare')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Care este provocarea ta?"
                />
                {errors.provocare && (
                  <p className="text-red-500 text-sm mt-1">{errors.provocare.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rezultat Dorit *
                </label>
                <textarea
                  {...register('rezultat')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ce rezultat vrei să obții?"
                />
                {errors.rezultat && (
                  <p className="text-red-500 text-sm mt-1">{errors.rezultat.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel *
                </label>
                <select
                  {...register('nivel')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selectează nivelul</option>
                  <option value="Începător">Începător</option>
                  <option value="Intermediar">Intermediar</option>
                  <option value="Avansat">Avansat</option>
                </select>
                {errors.nivel && (
                  <p className="text-red-500 text-sm mt-1">{errors.nivel.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Înapoi
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Continuă
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment & Invoice */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tip Factură *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      {...register('invoiceType')}
                      type="radio"
                      value="PF"
                      className="mr-2"
                    />
                    <span>Persoană Fizică</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      {...register('invoiceType')}
                      type="radio"
                      value="PJ"
                      className="mr-2"
                    />
                    <span>Persoană Juridică</span>
                  </label>
                </div>
              </div>

              {watchInvoiceType === 'PJ' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nume Firmă *
                    </label>
                    <input
                      {...register('companieFirma')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CUI *
                    </label>
                    <input
                      {...register('cui')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="RO12345678"
                    />
                  </div>
                </>
              )}

              <div className="border-t pt-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    {...register('gdprConsent')}
                    type="checkbox"
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm">
                    Sunt de acord cu prelucrarea datelor personale conform GDPR *
                  </span>
                </label>
                {errors.gdprConsent && (
                  <p className="text-red-500 text-sm mt-1">{errors.gdprConsent.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-start cursor-pointer">
                  <input
                    {...register('marketingConsent')}
                    type="checkbox"
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm">
                    Vreau să primesc informații despre viitoarele evenimente
                  </span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Înapoi
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-300"
                >
                  {loading ? 'Procesare...' : 'Finalizează și Plătește'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
