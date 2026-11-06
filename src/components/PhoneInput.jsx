import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
} from 'libphonenumber-js/max'
import 'country-flag-icons/3x2/flags.css'
import './PhoneInput.css'

const countryCodes = getCountries()

function phoneError(number, country, required, t) {
  if (!number) return required ? t('fillField') : ''
  const lengthError = validatePhoneNumberLength(number, country)
  if (lengthError === 'TOO_SHORT' || lengthError === 'NOT_A_NUMBER') return t('phoneTooShort')
  if (lengthError === 'TOO_LONG') return t('phoneTooLong')
  return isValidPhoneNumber(number, country) ? '' : t('phoneInvalid')
}

export default function PhoneInput({
  id,
  name,
  value = '',
  onChange,
  required = false,
  disabled = false,
  className = '',
  t,
  lang = 'ru',
}) {
  const inputRef = useRef(null)
  const countryPickerRef = useRef(null)
  const [country, setCountry] = useState('KG')
  const [nationalNumber, setNationalNumber] = useState('')
  const [touched, setTouched] = useState(false)
  const [countryPickerOpen, setCountryPickerOpen] = useState(false)
  const countries = useMemo(() => {
    const locale = lang === 'kg' ? 'ky-KG' : lang === 'en' ? 'en' : 'ru'
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
    return countryCodes
      .map(country => ({
        country,
        name: displayNames.of(country) || country,
        callingCode: getCountryCallingCode(country),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, locale))
  }, [lang])
  const error = phoneError(nationalNumber, country, required, t)
  const callingCode = getCountryCallingCode(country)

  useEffect(() => {
    if (!value) {
      setNationalNumber('')
      return
    }
    const parsed = parsePhoneNumberFromString(value)
    if (parsed) {
      if (parsed.country && parsed.country !== country) setCountry(parsed.country)
      setNationalNumber(parsed.nationalNumber)
    }
  }, [value])

  useEffect(() => {
    if (inputRef.current) inputRef.current.setCustomValidity(error)
  }, [error])

  useEffect(() => {
    if (!countryPickerOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (!countryPickerRef.current?.contains(event.target)) setCountryPickerOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setCountryPickerOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [countryPickerOpen])

  const handleNumberChange = (event) => {
    const raw = event.target.value
    const pastedPhone = raw.startsWith('+') ? parsePhoneNumberFromString(raw) : null
    if (pastedPhone?.country) {
      setCountry(pastedPhone.country)
      setNationalNumber(pastedPhone.nationalNumber)
      onChange(pastedPhone.number)
      return
    }

    const digits = raw.replace(/\D/g, '').slice(0, 17)
    if (validatePhoneNumberLength(digits, country) === 'TOO_LONG') return
    const parsedPhone = parsePhoneNumberFromString(digits, country)
    setNationalNumber(digits)
    onChange(parsedPhone?.number || (digits ? `+${callingCode}${digits}` : ''))
  }

  const handleCountryChange = (event) => {
    const nextCountry = event
    const nextCallingCode = getCountryCallingCode(nextCountry)
    setCountry(nextCountry)
    setCountryPickerOpen(false)

    if (!nationalNumber) {
      onChange('')
      return
    }

    const parsedPhone = parsePhoneNumberFromString(nationalNumber, nextCountry)
    const nextNumber = parsedPhone?.number || `+${nextCallingCode}${nationalNumber.replace(/\D/g, '')}`
    setNationalNumber(parsedPhone?.nationalNumber || nationalNumber)
    onChange(nextNumber)
  }

  return (
    <div className={`phone-input ${className}`}>
      <div className="phone-input__control">
        <div className="phone-input__country-wrap" ref={countryPickerRef}>
          <button
            className="phone-input__country"
            type="button"
            onClick={() => setCountryPickerOpen(open => !open)}
            disabled={disabled}
            aria-label={`${t('phoneCountry')} +${callingCode}`}
            aria-expanded={countryPickerOpen}
            aria-haspopup="listbox"
          >
            <span className={`phone-input__flag-icon flag:${country}`} aria-hidden="true" />
            <span className="phone-input__chevron" aria-hidden="true" />
          </button>
          {countryPickerOpen && (
            <div className="phone-input__country-list" role="listbox" aria-label={t('phoneCountry')}>
              {countries.map(option => (
                <button
                  key={option.country}
                  className="phone-input__country-option"
                  type="button"
                  role="option"
                  aria-selected={option.country === country}
                  onClick={() => handleCountryChange(option.country)}
                >
                  <span className={`phone-input__flag-icon flag:${option.country}`} aria-hidden="true" />
                  <span>{option.name}</span>
                  <span>+{option.callingCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="phone-input__calling-code" aria-hidden="true">+{callingCode}</span>
        <input
          ref={inputRef}
          id={id}
          name={name}
          className="form-input phone-input__number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={nationalNumber}
          onChange={handleNumberChange}
          onBlur={() => setTouched(true)}
          onInvalid={() => setTouched(true)}
          required={required}
          disabled={disabled}
          maxLength={17}
          aria-invalid={Boolean(touched && error)}
          aria-describedby={touched && error ? `${id}-error` : undefined}
        />
      </div>
      {touched && error && <span className="phone-input__error" id={`${id}-error`}>{error}</span>}
    </div>
  )
}
