import React from 'react'
import styles from './Badge.module.css'

export interface IBadgeProps {
  className?: string
  variant?: BadgeVariant
  text: string
}

type BadgeVariant = 'default' | 'info' | 'success' | 'warn' | 'error'

const Badge = ({
  className,
  variant = 'default',
  text,
}: IBadgeProps): JSX.Element => {
  const baseStyle = styles['pd-badge']
  const variantStyle = styles[`pd-badge--${variant}`]
  return (
    <span className={`${baseStyle} ${variantStyle} ${className}`}>{text}</span>
  )
}

export default Badge
