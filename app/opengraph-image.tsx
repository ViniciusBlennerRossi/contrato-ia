import { ImageResponse } from 'next/og'

/**
 * Imagem que aparece quando o link é colado no WhatsApp, LinkedIn ou Telegram.
 * Sem ela o site era compartilhado como texto cinza sem cartão — ao lado de
 * qualquer concorrente com prévia, parecia amador.
 */
export const alt = 'ContratoIA — contratos jurídicos gerados por IA'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0e0e0e',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 44 }}>⚖️</div>
          <div style={{ fontSize: 36, color: '#ffffff', fontWeight: 600, letterSpacing: 1 }}>
            ContratoIA
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, color: '#ffffff', fontWeight: 700, lineHeight: 1.1 }}>
            Contratos jurídicos
          </div>
          <div style={{ fontSize: 76, color: '#c9a84c', fontWeight: 700, lineHeight: 1.1 }}>
            prontos em segundos.
          </div>
          <div style={{ fontSize: 30, color: '#9a9284', marginTop: 28 }}>
            16 tipos de contrato · gerados por IA · a partir de R$29
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 4, background: '#c9a84c' }} />
          <div style={{ fontSize: 26, color: '#6d675c' }}>contrato.v3app.com.br</div>
        </div>
      </div>
    ),
    size
  )
}
