import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import App from './App.tsx'

const theme = createTheme({
  primaryColor: 'blue',
  defaultColorScheme: 'dark',
  fontFamily: 'Inter, sans-serif',
  fontFamilyMonospace: 'Inter, monospace',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
        shadow: 'xs',
      },
      styles: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          transition: 'all 0.3s ease',
          '&:focus': {
            boxShadow: '0 0 0 3px rgba(51, 154, 240, 0.1)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          transition: 'all 0.2s ease',
        },
      },
    },
    Pagination: {
      styles: {
        control: {
          transition: 'all 0.2s ease',
          '&[data-active]': {
            transform: 'scale(1.05)',
          },
          '&:hover': {
            backgroundColor: 'rgba(51, 154, 240, 0.1)',
          },
        },
      },
    },
    Switch: {
      styles: {
        track: {
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
        label: {
          cursor: 'pointer',
          fontWeight: 500,
          transition: 'color 0.2s ease',
        },
      },
    },
    Accordion: {
      styles: {
        control: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
        panel: {
          animation: 'fadeIn 0.3s ease',
        },
      },
    },
    ScrollArea: {
      styles: {
        scrollbar: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  </React.StrictMode>,
)
