import { useState, useRef, useEffect } from 'react';

export default function SearchableLanguageDropdown({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="custom-dropdown-container language-dropdown notranslate" translate="no" ref={dropdownRef} style={{ position: 'relative', width: '150px' }}>
      <div
        className={`custom-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery('');
        }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 0.9rem',
          borderRadius: '10px',
          border: '1.5px solid var(--border-color)',
          background: 'var(--surface-color)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: '700',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          userSelect: 'none'
        }}
      >
        <span>{selectedOption ? selectedOption.label : 'Select Language'}</span>
        <svg
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            marginLeft: '0.4rem',
            color: 'var(--text-secondary)'
          }}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && (
        <div
          className="custom-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '200px',
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            padding: '0.6rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            animation: 'slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Search Input Box */}
          <div style={{ padding: '0.1rem' }}>
            <input
              type="text"
              placeholder="Search language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem',
                fontSize: '0.82rem',
                borderRadius: '8px',
                border: '1.5px solid var(--border-color)',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {/* Languages List */}
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              maxHeight: '180px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: value === option.value ? 'var(--primary-light)' : 'transparent',
                    color: value === option.value ? 'var(--primary-color)' : 'var(--text-primary)',
                    fontWeight: value === option.value ? '800' : '600',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  className="lang-item-hover"
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '900' }}>✓</span>
                  )}
                </li>
              ))
            ) : (
              <li style={{ padding: '0.6rem', fontSize: '0.82rem', color: 'var(--text-light)', textAlign: 'center' }}>
                No match found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
