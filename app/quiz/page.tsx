'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface QuizResponses {
  climate: string;
  firearms: string;
  marijuana: string;
  lgbtq: string;
  costOfLiving: string;
  taxes: string;
  lifestyle: string;
  vaFacilities: string;
  safety: string;
  gasPrices: string;
}

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 10;
  const [responses, setResponses] = useState<Partial<QuizResponses>>({});

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setResponses({ ...responses, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/quiz/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responses),
      });

      const data = await response.json();
      
      // Navigate to results page with data
      sessionStorage.setItem('quizResults', JSON.stringify(data));
      router.push('/results');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error processing quiz. Please try again.');
    }
  };

  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>Find Your Perfect Retirement City</h1>
        <p>Answer a few questions to discover cities that match your lifestyle preferences.</p>
      </div>

      <form className="quiz-form" onSubmit={handleSubmit}>
        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text">
            Question <span>{currentQuestion}</span> of <span>{totalQuestions}</span>
          </div>
        </div>

        {/* Question 1: Climate */}
        <div className={`question-card ${currentQuestion === 1 ? 'active' : ''}`}>
          <div className="question-icon">
            <i className="fas fa-sun"></i>
          </div>
          <h2 className="question-title">How important is warm weather year-round?</h2>
          <p className="question-subtitle">Do you prefer consistent warmth, or are you okay with seasonal changes?</p>
          <div className="rating-options">
            {['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Essential'].map((label, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name="climate"
                  value={String(i + 1)}
                  id={`climate-${i + 1}`}
                  checked={responses.climate === String(i + 1)}
                  onChange={(e) => handleInputChange('climate', e.target.value)}
                />
                <label htmlFor={`climate-${i + 1}`} className="rating-btn">
                  <span className="rating-label">{label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Question 2: Firearms */}
        <div className={`question-card ${currentQuestion === 2 ? 'active' : ''}`}>
          <div className="question-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h2 className="question-title">How important are gun-friendly laws?</h2>
          <p className="question-subtitle">Looking for constitutional carry or other 2A-friendly policies?</p>
          <div className="rating-options">
            {['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Essential'].map((label, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name="firearms"
                  value={String(i + 1)}
                  id={`firearms-${i + 1}`}
                  checked={responses.firearms === String(i + 1)}
                  onChange={(e) => handleInputChange('firearms', e.target.value)}
                />
                <label htmlFor={`firearms-${i + 1}`} className="rating-btn">
                  <span className="rating-label">{label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Question 3: Marijuana */}
        <div className={`question-card ${currentQuestion === 3 ? 'active' : ''}`}>
          <div className="question-icon">
            <i className="fas fa-leaf"></i>
          </div>
          <h2 className="question-title">How important is marijuana legality?</h2>
          <p className="question-subtitle">Prefer recreational legal, medical only, or doesn&apos;t matter?</p>
          <div className="rating-options">
            {['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Essential'].map((label, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name="marijuana"
                  value={String(i + 1)}
                  id={`marijuana-${i + 1}`}
                  checked={responses.marijuana === String(i + 1)}
                  onChange={(e) => handleInputChange('marijuana', e.target.value)}
                />
                <label htmlFor={`marijuana-${i + 1}`} className="rating-btn">
                  <span className="rating-label">{label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Question 4: LGBTQ */}
        <div className={`question-card ${currentQuestion === 4 ? 'active' : ''}`}>
          <div className="question-icon">
            <i className="fas fa-rainbow"></i>
          </div>
          <h2 className="question-title">How important is LGBTQ+ friendliness?</h2>
          <p className="question-subtitle">Looking for inclusive and welcoming communities?</p>
          <div className="rating-options">
            {['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Essential'].map((label, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name="lgbtq"
                  value={String(i + 1)}
                  id={`lgbtq-${i + 1}`}
                  checked={responses.lgbtq === String(i + 1)}
                  onChange={(e) => handleInputChange('lgbtq', e.target.value)}
                />
                <label htmlFor={`lgbtq-${i + 1}`} className="rating-btn">
                  <span className="rating-label">{label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Question 5: Cost of Living */}
        <div className={`question-card ${currentQuestion === 5 ? 'active' : ''}`}>
          <div className="question-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <h2 className="question-title">How important is affordable cost of living?</h2>
          <p className="question-subtitle">Want to stretch your retirement dollars further?</p>
          <div className="rating-options">
            {['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Essential'].map((label, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name="costOfLiving"
                  value={String(i + 1)}
                  id={`cost-${i + 1}`}
                  checked={responses.costOfLiving === String(i + 1)}
                  onChange={(e) => handleInputChange('costOfLiving', e.target.value)}
                />
                <label htmlFor={`cost-${i + 1}`} className="rating-btn">
                  <span className="rating-label">{label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Question 6: Taxes */}
        <div className={`question-card ${currentQuestion === 6 ? 'active' : ''}`}>
          <div className="question-icon">
            <i className="fas fa-percent"></i>
          </div>
          <h2 className="question-title">How important are low state taxes?</h2>
          <p className="question-subtitle">Prefer states with no income tax or lower overall tax burden?</p>
          <div className="rating-options">
            {['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Essential'].map((label, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name="taxes"
                  value={String(i + 1)}
                  id={`taxes-${i + 1}`}
                  checked={responses.taxes === String(i + 1)}
                  onChange={(e) => handleInputChange('taxes', e.target.value)}
                />
                <label htmlFor={`taxes-${i + 1}`} className="rating-btn">
                  <span className="rating-label">{label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Question 7: Lifestyle */}
        <div className={`question-card ${currentQuestion === 7 ? 'active' : ''}`}>
          <div className="question-icon">
            <i className="fas fa-home"></i>
          </div>
          <h2 className="question-title">What type of lifestyle do you prefer?</h2>
          <p className="question-subtitle">Choose between fast-paced urban living and relaxed small-town life.</p>
          <div className="rating-options lifestyle-options">
            <div>
              <input
                type="radio"
                name="lifestyle"
                value="urban"
                id="lifestyle-1"
                checked={responses.lifestyle === 'urban'}
                onChange={(e) => handleInputChange('lifestyle', e.target.value)}
              />
              <label htmlFor="lifestyle-1" className="rating-btn lifestyle-btn">
                <i className="fas fa-city"></i>
                <span className="rating-label">Urban/Metro</span>
                <span className="rating-desc">Bustling city life</span>
              </label>
            </div>
            <div>
              <input
                type="radio"
                name="lifestyle"
                value="suburban"
                id="lifestyle-2"
                checked={responses.lifestyle === 'suburban'}
                onChange={(e) => handleInputChange('lifestyle', e.target.value)}
              />
              <label htmlFor="lifestyle-2" className="rating-btn lifestyle-btn">
                <i className="fas fa-house-user"></i>
                <span className="rating-label">Suburban</span>
                <span className="rating-desc">Best of both worlds</span>
              </label>
            </div>
            <div>
              <input
                type="radio"
                name="lifestyle"
                value="rural"
                id="lifestyle-3"
                checked={responses.lifestyle === 'rural'}
                onChange={(e) => handleInputChange('lifestyle', e.target.value)}
              />
              <label htmlFor="lifestyle-3" className="rating-btn lifestyle-btn">
                <i className="fas fa-tree"></i>
                <span className="rating-label">Slow Living</span>
                <span className="rating-desc">Quiet small-town pace</span>
              </label>
            </div>
          </div>
        </div>

        {/* Question 8: VA Facilities */}
        <div className={`question-card ${currentQuestion === 8 ? 'active' : ''}`}>
          <div className="question-icon">
            <i className="fas fa-hospital"></i>
          </div>
          <h2 className="question-title">How important are nearby VA facilities?</h2>
          <p className="question-subtitle">Need easy access to VA healthcare and services?</p>
          <div className="rating-options">
            {['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Essential'].map((label, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name="vaFacilities"
                  value={String(i + 1)}
                  id={`va-${i + 1}`}
                  checked={responses.vaFacilities === String(i + 1)}
                  onChange={(e) => handleInputChange('vaFacilities', e.target.value)}
                />
                <label htmlFor={`va-${i + 1}`} className="rating-btn">
                  <span className="rating-label">{label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Question 9: Safety */}
        <div className={`question-card ${currentQuestion === 9 ? 'active' : ''}`}>
          <div className="question-icon">
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="question-title">How important is low crime and safety?</h2>
          <p className="question-subtitle">Want to feel secure in your community?</p>
          <div className="rating-options">
            {['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Essential'].map((label, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name="safety"
                  value={String(i + 1)}
                  id={`safety-${i + 1}`}
                  checked={responses.safety === String(i + 1)}
                  onChange={(e) => handleInputChange('safety', e.target.value)}
                />
                <label htmlFor={`safety-${i + 1}`} className="rating-btn">
                  <span className="rating-label">{label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Question 10: Gas Prices */}
        <div className={`question-card ${currentQuestion === 10 ? 'active' : ''}`}>
          <div className="question-icon">
            <i className="fas fa-gas-pump"></i>
          </div>
          <h2 className="question-title">How important are affordable gas prices?</h2>
          <p className="question-subtitle">Want to keep your transportation costs down?</p>
          <div className="rating-options">
            {['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Essential'].map((label, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name="gasPrices"
                  value={String(i + 1)}
                  id={`gas-${i + 1}`}
                  checked={responses.gasPrices === String(i + 1)}
                  onChange={(e) => handleInputChange('gasPrices', e.target.value)}
                />
                <label htmlFor={`gas-${i + 1}`} className="rating-btn">
                  <span className="rating-label">{label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="quiz-navigation">
          <button
            type="button"
            className="nav-btn prev-btn"
            onClick={handlePrev}
            disabled={currentQuestion === 1}
          >
            <i className="fas fa-arrow-left"></i>
            Previous
          </button>
          {currentQuestion < totalQuestions ? (
            <button type="button" className="nav-btn next-btn" onClick={handleNext}>
              Next
              <i className="fas fa-arrow-right"></i>
            </button>
          ) : (
            <button type="submit" className="nav-btn submit-btn">
              See My Matches
              <i className="fas fa-check"></i>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

