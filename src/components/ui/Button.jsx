const variants = {
  primary: 'btn-primary',
  gold:    'btn-gold',
  outline: 'btn-outline',
  ghost:   'btn-ghost',
  danger:  'btn-danger',
}

const sizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-4 py-2.5 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  as: Tag = 'button',
  children,
  ...rest
}) {
  const cls = `${variants[variant] || variants.primary} ${sizes[size] || ''} ${className}`
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  )
}
