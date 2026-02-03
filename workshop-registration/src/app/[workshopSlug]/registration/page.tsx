'use client';

import { useState, FormEvent } from 'react';
import { useParams } from 'next/navigation';

/**
 * Workshop Registration Page - EXACT REPLICA of original Google Apps Script form
 *
 * 3-Step Registration Flow:
 * Step 1: Hai să ne cunoaștem (name + email + phone)
 * Step 2: Setarea obiectivelor (challenge, result, level slider)
 * Step 3: Detalii Finale (invoice checkbox, GDPR, payment)
 */

export default function RegistrationPage() {
  const params = useParams();
  const workshopSlug = params.workshopSlug as string;

  // Form state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Se procesează...');
  const [loadingSubtext, setLoadingSubtext] = useState('');
  const [error, setError] = useState('');

  // Step 1 - Identification
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 - Objectives
  const [challenge, setChallenge] = useState('');
  const [result, setResult] = useState('');
  const [level, setLevel] = useState('5');

  // Step 3 - Final Details
  const [invoiceNeeded, setInvoiceNeeded] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [cui, setCui] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Payment link stored from Step 1
  const [paymentLink, setPaymentLink] = useState('');

  // STEP 1: Check member status with name + email + phone
  const handleIdentifyStep = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone) {
      setError('Toate câmpurile sunt obligatorii');
      return;
    }

    setLoading(true);
    setLoadingText('Verificare date...');
    setLoadingSubtext('Se verifică statusul de membru.');
    setError('');

    try {
      const response = await fetch('/api/check-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopSlug,
          name,
          email,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Eroare la verificare');
        return;
      }

      // Store payment link for later
      setPaymentLink(data.paymentLink);
      setStep(2);
    } catch (err) {
      setError('Eroare de conexiune. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 → STEP 3
  const handleObjectivesStep = (e: FormEvent) => {
    e.preventDefault();

    if (!challenge || !result || !level) {
      setError('Toate câmpurile sunt obligatorii');
      return;
    }

    setError('');
    setStep(3);
  };

  // STEP 3: Submit registration
  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!gdprConsent) {
      setError('Consimțământul GDPR este obligatoriu');
      return;
    }

    if (invoiceNeeded && (!companyName || !cui)) {
      setError('Pentru factura PJ, numele firmei și CUI sunt obligatorii');
      return;
    }

    setLoading(true);
    setLoadingText('Se procesează înregistrarea...');
    setLoadingSubtext('Vă rugăm să așteptați.');
    setError('');

    try {
      const registrationData = {
        workshopSlug,
        email,
        name,
        phone,
        challenge,
        result,
        level,
        invoiceType: invoiceNeeded ? 'PJ' : 'PF',
        companyName: invoiceNeeded ? companyName : name,
        cui: invoiceNeeded ? cui : '0000000000000',
        gdprConsent,
        marketingConsent,
      };

      const response = await fetch('/api/submit-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopSlug,
          formData: registrationData,
        }),
      });

      const resultData = await response.json();

      if (!response.ok) {
        setError(resultData.error || 'Eroare la înregistrare');
        return;
      }

      // Redirect to payment using link from response
      setLoadingText('Redirecționare către plată...');
      setLoadingSubtext('Veți fi redirecționat în câteva secunde.');

      setTimeout(() => {
        window.location.href = resultData.paymentLink;
      }, 1500);
    } catch (err) {
      setError('Eroare de conexiune. Încearcă din nou.');
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-color: #009B9E;
          --primary-hover: #007f82;
          --secondary-color: #263645;
          --accent-color: #E74C3C;
          --bg-color: #F5F7FA;
          --card-bg: #FFFFFF;
          --text-color: #263645;
          --border-radius: 12px;
        }

        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        body {
          font-family: 'Montserrat', sans-serif;
          background-color: var(--bg-color);
          color: var(--text-color);
          margin: 0;
          padding: 0;
          line-height: 1.5;
          font-size: 16px;
        }

        h1, h2, h3, h4 {
          margin-top: 0;
          font-weight: 700;
          line-height: 1.2;
        }

        p {
          margin-bottom: 1rem;
        }

        .hidden {
          display: none !important;
        }

        .container {
          width: 100%;
          padding: 20px 16px;
          margin: 0 auto;
          min-height: 100vh;
        }

        .hero {
          text-align: center;
          margin-bottom: 30px;
        }

        .logo-container {
          margin-bottom: 20px;
          background-color: #FFFFFF;
          padding: 24px 20px;
          border-radius: var(--border-radius);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        }

        .logo-container img {
          width: 220px;
          height: auto;
          display: block;
          margin: 0 auto;
        }

        .hero h1 {
          color: var(--text-color);
          font-size: 1.5rem;
          margin-bottom: 12px;
          font-weight: 800;
        }

        .hero h1 .title-line-1 {
          display: block;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .hero h1 .title-line-2 {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .hero p {
          color: var(--text-color);
          font-size: 1rem;
          opacity: 0.9;
          font-weight: 400;
          padding: 0 10px;
        }

        .form-card {
          background-color: var(--card-bg);
          border-radius: var(--border-radius);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          padding: 24px 20px;
          margin-bottom: 40px;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          margin-bottom: 25px;
        }

        .dot {
          height: 10px;
          width: 10px;
          background-color: #e0e0e0;
          border-radius: 50%;
          margin: 0 8px;
          transition: all 0.3s;
        }

        .dot.active {
          background-color: var(--primary-color);
          transform: scale(1.2);
        }

        .dot.completed {
          background-color: var(--primary-color);
          opacity: 0.5;
        }

        .step-title {
          font-size: 1.25rem;
          color: var(--secondary-color);
          margin-bottom: 20px;
          font-weight: 700;
          text-align: center;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 15px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--secondary-color);
          font-size: 0.95rem;
        }

        input[type="text"],
        input[type="email"],
        input[type="tel"],
        textarea {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #ced4da;
          border-radius: 8px;
          font-family: inherit;
          font-size: 16px;
          color: var(--text-color);
          background-color: #fff;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(0, 155, 158, 0.15);
        }

        textarea {
          min-height: 120px;
          resize: vertical;
        }

        input[type="range"] {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          background: #e0e0e0;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary-color);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary-color);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 5px;
          font-size: 12px;
          color: #666;
        }

        .level-value {
          font-size: 20px;
          font-weight: bold;
          color: var(--primary-color);
          text-align: center;
          margin-top: 10px;
        }

        .checkbox-group {
          display: flex;
          align-items: start;
          gap: 12px;
          margin-bottom: 15px;
          cursor: pointer;
          padding: 8px 0;
        }

        .checkbox-group input {
          margin-top: 3px;
          width: 20px;
          height: 20px;
          accent-color: var(--primary-color);
          cursor: pointer;
          flex-shrink: 0;
        }

        .checkbox-group span {
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .invoice-fields {
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          margin-bottom: 20px;
        }

        .btn {
          display: block;
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .btn-primary {
          background-color: var(--primary-color);
          color: white;
        }

        .btn-primary:active {
          transform: scale(0.98);
        }

        .btn-primary:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background-color: transparent;
          color: #777;
          margin-top: 15px;
          text-transform: none;
          font-weight: 500;
          padding: 12px;
          box-shadow: none;
        }

        .footer {
          background-color: var(--secondary-color);
          color: white;
          padding: 40px 20px;
          font-size: 0.9rem;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 25px;
          margin-bottom: 40px;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
        }

        .benefit-icon {
          font-size: 1.4rem;
          color: var(--primary-color);
          margin-right: 15px;
          width: 30px;
          text-align: center;
          flex-shrink: 0;
        }

        .benefit-text h4 {
          font-size: 1.1rem;
          margin-bottom: 4px;
          color: #fff;
        }

        .benefit-text p {
          font-size: 0.9rem;
          opacity: 0.8;
          margin: 0;
          line-height: 1.4;
        }

        .copyright {
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 25px;
          margin-top: 30px;
          font-size: 0.8rem;
          opacity: 0.7;
          line-height: 1.6;
        }

        .copyright a {
          color: white;
          text-decoration: none;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.5);
        }

        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.98);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.3s;
          padding: 20px;
          text-align: center;
        }

        .loading-overlay.active {
          visibility: visible;
          opacity: 1;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }

        .error-message {
          background-color: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }

        .payment-button {
          background-color: var(--primary-color);
          color: white;
          padding: 18px;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }

        .payment-button:active {
          transform: scale(0.98);
        }

        .payment-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }

        .payment-button-text {
          font-size: 18px;
          font-weight: bold;
        }

        .payment-button-subtext {
          font-size: 12px;
          font-weight: normal;
          margin-top: 5px;
          opacity: 0.9;
        }

        @media (min-width: 768px) {
          .container {
            max-width: 700px;
            padding: 40px 20px;
          }

          .hero h1 {
            font-size: 2rem;
            margin-bottom: 20px;
          }

          .hero p {
            font-size: 1.1rem;
          }

          .logo-container {
            padding: 40px;
          }

          .logo-container img {
            width: 300px;
          }

          .form-card {
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          }

          .benefits-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
          }
        }
      `}</style>

      {/* Add Montserrat font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Loading Overlay */}
      <div className={`loading-overlay ${loading ? 'active' : ''}`}>
        <div className="spinner"></div>
        <h3 style={{ color: 'var(--secondary-color)', marginBottom: '10px' }}>
          {loadingText}
        </h3>
        <p style={{ color: '#666', margin: 0 }}>
          {loadingSubtext}
        </p>
      </div>

      <div className="container">
        <div className="hero">
          <div className="logo-container">
            <img
              src="/logo.png"
              alt="BIZZ.CLUB Logo"
            />
          </div>
          <h1>
            <span className="title-line-1">Înscriere Workshop</span>
            <span className="title-line-2">BIZZ.CLUB Satu Mare</span>
          </h1>
          <p>Felicitări pentru decizia de a investi în creșterea ta! ("Growing Together")</p>
        </div>

        <div className="form-card">
          {/* Step Indicator */}
          <div className="step-indicator">
            <span className={`dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}></span>
            <span className={`dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}></span>
            <span className={`dot ${step >= 3 ? 'active' : ''}`}></span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* STEP 1: Hai să ne cunoaștem */}
          {step === 1 && (
            <form onSubmit={handleIdentifyStep}>
              <h2 className="step-title">Hai să ne cunoaștem</h2>

              <div className="form-group">
                <label htmlFor="name">Nume Prenume *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Ex: Ion Popescu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="Ex: ion@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefon *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="07xx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Mai departe
              </button>
            </form>
          )}

          {/* STEP 2: Setarea obiectivelor */}
          {step === 2 && (
            <form onSubmit={handleObjectivesStep}>
              <h2 className="step-title">Setarea obiectivelor</h2>

              <div className="form-group">
                <label htmlFor="challenge">Care este provocarea ta? *</label>
                <textarea
                  id="challenge"
                  name="challenge"
                  required
                  placeholder="Ce provocare ai în afacere pe care vrei să o rezolvi?"
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="result">Ce rezultat vrei să obții? *</label>
                <input
                  type="text"
                  id="result"
                  name="result"
                  required
                  placeholder="Ce rezultat concret îți dorești?"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="level">Nivel actual (1-10) *</label>
                <input
                  type="range"
                  id="level"
                  name="level"
                  min="1"
                  max="10"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  style={{
                    background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${(parseInt(level) - 1) * 11.11}%, #e0e0e0 ${(parseInt(level) - 1) * 11.11}%, #e0e0e0 100%)`
                  }}
                />
                <div className="level-value">{level}</div>
                <div className="range-labels">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Continuă
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                Înapoi
              </button>
            </form>
          )}

          {/* STEP 3: Detalii Finale */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit}>
              <h2 className="step-title">Detalii Finale</h2>

              {/* Invoice checkbox */}
              <div className="checkbox-group" style={{ marginBottom: '20px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
                <input
                  type="checkbox"
                  id="invoiceNeeded"
                  name="invoiceNeeded"
                  checked={invoiceNeeded}
                  onChange={(e) => setInvoiceNeeded(e.target.checked)}
                />
                <label htmlFor="invoiceNeeded" style={{ margin: 0, cursor: 'pointer', fontWeight: 600 }}>
                  Doresc factură pe persoană juridică (Firmă)
                </label>
              </div>

              {/* Invoice fields (conditional) */}
              {invoiceNeeded && (
                <div className="invoice-fields">
                  <div className="form-group">
                    <label htmlFor="companyName">Nume Companie *</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      placeholder="Ex: SC FIRMA SRL"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required={invoiceNeeded}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="cui">CUI *</label>
                    <input
                      type="text"
                      id="cui"
                      name="cui"
                      placeholder="Ex: RO12345678"
                      value={cui}
                      onChange={(e) => setCui(e.target.value)}
                      required={invoiceNeeded}
                    />
                  </div>
                </div>
              )}

              {/* GDPR consent */}
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="gdprConsent"
                  name="gdprConsent"
                  required
                  checked={gdprConsent}
                  onChange={(e) => setGdprConsent(e.target.checked)}
                />
                <label htmlFor="gdprConsent" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem' }}>
                  Sunt de acord cu prelucrarea datelor personale conform GDPR *
                </label>
              </div>

              {/* Marketing consent */}
              <div className="checkbox-group" style={{ marginBottom: '25px' }}>
                <input
                  type="checkbox"
                  id="marketingConsent"
                  name="marketingConsent"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                />
                <label htmlFor="marketingConsent" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem' }}>
                  Doresc să primesc comunicări despre evenimente viitoare
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !gdprConsent}
                className="payment-button"
              >
                <div className="payment-button-text">
                  PLĂTEȘTE ȘI REZERVĂ LOCUL
                </div>
                <div className="payment-button-subtext">
                  Vei fi redirecționat către Stripe
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(2)}
              >
                Înapoi
              </button>
            </form>
          )}
        </div>

        {/* Footer - 6 Benefits */}
        <div className="footer">
          <div className="benefits-grid">
            {/* Benefit 1 */}
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h4>Educație de top</h4>
                <p>Conținut premium de la experți cu experiență reală în business</p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h4>Networking & Conexiuni</h4>
                <p>Întâlnești antreprenori cu viziuni similare și construiești relații valoroase</p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h4>Recomandări</h4>
                <p>Acces la recomandări de servicii și soluții verificate de comunitate</p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h4>Comunitate</h4>
                <p>Faci parte dintr-o comunitate activă de antreprenori care se susțin reciproc</p>
              </div>
            </div>

            {/* Benefit 5 */}
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h4>Unitate</h4>
                <p>Spirit de echipă și colaborare pentru atingerea obiectivelor comune</p>
              </div>
            </div>

            {/* Benefit 6 */}
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h4>Avantaje</h4>
                <p>Beneficii exclusive pentru membrii BIZZ.CLUB</p>
              </div>
            </div>
          </div>

          <div className="copyright">
            © 2026 BIZZ.CLUB Satu Mare |{' '}
            <a href="https://satumare.bizz.club/politica-de-confidentialitate" target="_blank" rel="noopener noreferrer">
              Politica de confidențialitate
            </a>
            {' | Powered by '}
            <a href="https://deeplogic.ro" target="_blank" rel="noopener noreferrer">
              DeepLogic
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
