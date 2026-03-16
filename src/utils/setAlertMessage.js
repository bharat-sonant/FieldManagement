import { toast } from 'react-toastify'
import { createElement } from 'react'

const makeIcon = (color, symbol) =>
  createElement('span', {
    style: {
      width: 20, height: 20, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
    }
  }, symbol)

const icons = {
  success: makeIcon('#6a85f1', '✓'),
  error:   makeIcon('#d32f2f', '✕'),
  warn:    makeIcon('#ed6c02', '!'),
}

export const setAlertMessage = (type, message) => {
  const isMobile = window.matchMedia('(max-width: 768px)').matches

  const color = type === 'error' ? '#d32f2f' : type === 'warn' ? '#ed6c02' : '#2d3a8c'
  const progressColor = type === 'error' ? '#d32f2f' : type === 'warn' ? '#ed6c02' : '#6a85f1'

  const options = {
    position: isMobile ? 'bottom-center' : 'bottom-left',
    icon: icons[type] || icons.success,
    progressStyle: { background: progressColor, backgroundImage: 'none' },
    style: {
      fontSize: '14px',
      fontWeight: 'normal',
      color,
      marginBottom: isMobile ? '20px' : '0px',
      marginLeft: isMobile ? 'auto' : '0px',
      marginRight: isMobile ? 'auto' : '0',
      width: isMobile ? '85%' : '350px',
      background: '#FFFFFF',
    },
  }

  toast(message, options)
}
