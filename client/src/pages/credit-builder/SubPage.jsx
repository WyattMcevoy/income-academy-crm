import { useState } from 'react';

const FORM_FIELD_CONFIG = {
  businessName: { label: 'Business Name', placeholder: 'Business Name', type: 'text' },
  addressLine1: { label: 'Address Line 1', placeholder: 'Address Line 1', type: 'text' },
  addressLine2: { label: 'Address Line 2', placeholder: 'Address Line 2', type: 'text' },
  city: { label: 'City', placeholder: 'City', type: 'text' },
  state: { label: 'State', placeholder: 'State', type: 'text' },
  zipCode: { label: 'Zip Code', placeholder: 'Zip Code', type: 'text' },
  businessPhone: { label: 'Business Phone', placeholder: '(555) 555-5555', type: 'tel' },
  website: { label: 'Website', placeholder: 'www.yourbusiness.com', type: 'url' },
  businessEmail: { label: 'Business Email', placeholder: 'you@yourbusiness.com', type: 'email' },
  bankName: { label: 'Bank Name', placeholder: 'Bank Name', type: 'text' },
  licenseType: { label: 'License Type', placeholder: 'License Type', type: 'text' },
  licenseNumber: { label: 'License Number', placeholder: 'License Number', type: 'text' },
  dunsNumber: { label: 'DUNS Number', placeholder: '00-000-0000', type: 'text' },
};

export default function SubPage({ step, subSlug, content, progress, onSelect, onComplete, onBack, onNavigate, formData, onSaveForm }) {
  const [selectedOption, setSelectedOption] = useState(progress?.selected_option || null);
  const [showFollowUp, setShowFollowUp] = useState(!!progress?.selected_option);
  const [localFormData, setLocalFormData] = useState(formData || {});

  if (!content) {
    return (
      <div className="cb-subpage">
        <button className="cb-btn cb-btn-outline" onClick={onBack}>← Back</button>
        <p>Content coming soon.</p>
      </div>
    );
  }

  const completed = progress?.completed;
  const followUp = content.followUp?.[selectedOption];
  const status = followUp?.status || (completed ? 'positive' : null);

  const handleOptionClick = (optionValue) => {
    // Check if this option navigates to another sub-item
    const opt = content.options.find(o => o.value === optionValue);
    if (opt?.navigateTo) {
      onNavigate?.(opt.navigateTo);
      return;
    }
    setSelectedOption(optionValue);
    setShowFollowUp(true);
    onSelect(optionValue);
  };

  const handleFormChange = (field, value) => {
    setLocalFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSaveForm?.(localFormData);
    onComplete();
  };

  // Render the initial question view
  if (!showFollowUp) {
    return (
      <div className="cb-subpage">
        <div className="cb-subpage-header">
          <h2 className="cb-subpage-section">{content.stepSection || 'Foundation'}</h2>
          <span className="cb-subpage-subtitle">{content.title?.split(' ').slice(0, 3).join(' ').toUpperCase()}</span>
        </div>

        <div className="cb-info-box">
          <div className="cb-info-icon">ℹ️</div>
          <div className="cb-info-content">
            <h3 className="cb-info-title">{content.title}</h3>
            {content.description && <p className="cb-info-desc">{content.description}</p>}
          </div>
        </div>

        {content.options && content.options.length > 0 && (
          <div className={`cb-options-grid ${content.options.length <= 2 ? 'cb-options-two' : ''}`}>
            {content.options.map(opt => (
              <button
                key={opt.value}
                className={`cb-option-card ${selectedOption === opt.value ? 'cb-option-selected' : ''}`}
                onClick={() => handleOptionClick(opt.value)}
              >
                <span className="cb-option-icon">{opt.icon}</span>
                <span className="cb-option-label">{opt.value}</span>
              </button>
            ))}
          </div>
        )}

        <div className="cb-subpage-actions">
          <button className="cb-btn cb-btn-outline" onClick={onBack}>Go Back</button>
          <button className="cb-btn cb-btn-primary" disabled>Next</button>
        </div>
      </div>
    );
  }

  // Render follow-up view based on type
  return (
    <div className="cb-subpage">
      <div className="cb-subpage-header">
        <h2 className="cb-subpage-section">{content.stepSection || 'Foundation'}</h2>
        <span className="cb-subpage-subtitle">{content.title?.split(' ').slice(0, 3).join(' ').toUpperCase()}</span>
      </div>

      {/* Warning/Negative follow-up */}
      {followUp?.type === 'warning' && (
        <>
          <div className="cb-info-box cb-info-box-warning">
            <div className="cb-info-icon">⚠️</div>
            <div className="cb-info-content">
              <h3 className="cb-info-title">{followUp.title}</h3>
              {followUp.description && <p className="cb-info-desc">{followUp.description}</p>}
            </div>
          </div>

          {followUp.description && (
            <p className="cb-followup-text">
              While you work on this, you can continue to build your Credit Readiness Score by clicking on the right side to the next factor.
            </p>
          )}

          {followUp.resource && (
            <div className="cb-resource-section">
              <h4 className="cb-resource-heading">Featured Resource</h4>
              <a className="cb-resource-card" href={followUp.resource.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="cb-resource-icon">🔗</div>
                <div className="cb-resource-info">
                  <span className="cb-resource-name">{followUp.resource.name}</span>
                  <span className="cb-resource-desc">{followUp.resource.description}</span>
                  {followUp.resource.url && <span className="cb-resource-link">Go To Website →</span>}
                </div>
              </a>
            </div>
          )}

          <div className="cb-subpage-actions">
            <button className="cb-btn cb-btn-outline" onClick={() => setShowFollowUp(false)}>Go Back</button>
            {followUp.actionLabel && (
              <button className="cb-btn cb-btn-primary" onClick={() => { setSelectedOption(content.options[0]?.value); onSelect(content.options[0]?.value); }}>
                {followUp.actionLabel}
              </button>
            )}
          </div>
        </>
      )}

      {/* Form follow-up */}
      {followUp?.type === 'form' && (
        <>
          <div className="cb-info-box cb-info-box-success">
            <div className="cb-info-icon">📋</div>
            <div className="cb-info-content">
              <h3 className="cb-info-title">{followUp.title || 'Enter your details'}</h3>
              {followUp.description && <p className="cb-info-desc">{followUp.description}</p>}
            </div>
          </div>

          <div className="cb-form">
            {followUp.fields?.filter(f => !['city', 'state', 'zipCode'].includes(f)).map(fieldKey => {
              const config = FORM_FIELD_CONFIG[fieldKey] || { label: fieldKey, placeholder: fieldKey, type: 'text' };
              return (
                <div key={fieldKey} className="cb-form-field">
                  <input
                    type={config.type}
                    placeholder={config.placeholder}
                    value={localFormData[fieldKey] || ''}
                    onChange={(e) => handleFormChange(fieldKey, e.target.value)}
                    className="cb-input"
                  />
                </div>
              );
            })}
            {followUp.fields?.some(f => ['city', 'state', 'zipCode'].includes(f)) && (
              <div className="cb-form-row">
                {['city', 'state', 'zipCode'].map(fieldKey => {
                  if (!followUp.fields.includes(fieldKey)) return null;
                  const config = FORM_FIELD_CONFIG[fieldKey];
                  return (
                    <input
                      key={fieldKey}
                      type={config.type}
                      placeholder={config.placeholder}
                      value={localFormData[fieldKey] || ''}
                      onChange={(e) => handleFormChange(fieldKey, e.target.value)}
                      className="cb-input cb-input-inline"
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="cb-subpage-actions">
            <button className="cb-btn cb-btn-outline" onClick={() => setShowFollowUp(false)}>Go Back</button>
            <button className="cb-btn cb-btn-save" onClick={handleSave}>Save</button>
          </div>
        </>
      )}

      {/* Success follow-up */}
      {followUp?.type === 'success' && (
        <>
          <div className="cb-info-box cb-info-box-success">
            <div className="cb-info-icon">✅</div>
            <div className="cb-info-content">
              <h3 className="cb-info-title">{followUp.title || 'Completed'}</h3>
              {followUp.description && <p className="cb-info-desc">{followUp.description}</p>}
            </div>
          </div>

          <div className="cb-subpage-actions">
            <button className="cb-btn cb-btn-outline" onClick={() => setShowFollowUp(false)}>Go Back</button>
            <button className="cb-btn cb-btn-primary" onClick={onComplete}>Next</button>
          </div>
        </>
      )}

      {/* Info follow-up (neutral) */}
      {followUp?.type === 'info' && (
        <>
          <div className="cb-info-box">
            <div className="cb-info-icon">ℹ️</div>
            <div className="cb-info-content">
              <h3 className="cb-info-title">{followUp.title}</h3>
              {followUp.description && <p className="cb-info-desc">{followUp.description}</p>}
            </div>
          </div>

          {followUp.resource && (
            <div className="cb-resource-section">
              <h4 className="cb-resource-heading">Featured Resource</h4>
              <a className="cb-resource-card" href={followUp.resource.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="cb-resource-icon">🔗</div>
                <div className="cb-resource-info">
                  <span className="cb-resource-name">{followUp.resource.name}</span>
                  <span className="cb-resource-desc">{followUp.resource.description}</span>
                  {followUp.resource.url && <span className="cb-resource-link">Go To Website →</span>}
                </div>
              </a>
            </div>
          )}

          <div className="cb-subpage-actions">
            <button className="cb-btn cb-btn-outline" onClick={() => setShowFollowUp(false)}>Go Back</button>
            <button className="cb-btn cb-btn-primary" onClick={onComplete}>Next</button>
          </div>
        </>
      )}

      {/* Resource page follow-up (LexisNexis/ChexSystems style) */}
      {followUp?.type === 'resource-page' && (
        <>
          <div className="cb-info-box cb-info-box-amber">
            <div className="cb-info-icon">📋</div>
            <div className="cb-info-content">
              <h3 className="cb-info-title cb-info-title-amber">{followUp.title}</h3>
              <p className="cb-info-desc cb-info-desc-dark">{followUp.description}</p>
            </div>
          </div>

          <div className="cb-subpage-actions cb-subpage-actions-spread">
            <button className="cb-btn cb-btn-outline" onClick={() => setShowFollowUp(false)}>Go Back</button>
            {followUp.actionLabel && (
              <button className="cb-btn cb-btn-primary" onClick={() => {
                const yesOpt = content.options.find(o => o.value === 'Yes');
                if (yesOpt) { setSelectedOption('Yes'); onSelect('Yes'); }
              }}>
                {followUp.actionLabel}
              </button>
            )}
          </div>

          {followUp.helpText && (
            <p className="cb-followup-text" style={{ marginTop: '24px' }}>
              <strong>{followUp.helpText}</strong>
            </p>
          )}

          <div className="cb-resource-section">
            {followUp.resource && (
              <a className="cb-resource-card cb-resource-card-featured" href={followUp.resource.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="cb-resource-logo">{followUp.resource.name.charAt(0)}</div>
                <div className="cb-resource-info">
                  <span className="cb-resource-name">{followUp.resource.name}</span>
                  <span className="cb-resource-link">Go To Website →</span>
                </div>
              </a>
            )}
          </div>
        </>
      )}

      {/* Completed badge */}
      {completed && (
        <div className="cb-completed-banner">✅ This item has been completed</div>
      )}
    </div>
  );
}
