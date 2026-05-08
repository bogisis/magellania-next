'use client';

import React, { useState } from 'react';
import { content } from '@/lib/content';
import { colors, fonts } from '@/lib/brand';
import type { PriceRow } from '@/types';

export default function PricesTable() {
  const C = content.prices;
  const [activeTab, setActiveTab] = useState(C.tabs[0].id);

  const data = (C[activeTab] || []) as PriceRow[];

  return (
    <section
      style={{
        background: colors.earth100,
        padding: 'clamp(56px,10vw,100px) clamp(20px,6vw,80px)',
      }}
    >
      <span
        style={{
          fontFamily: fonts.body,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: colors.terra500,
          display: 'block',
          marginBottom: 12,
        }}
      >
        {C.eyebrow}
      </span>

      <h2
        style={{
          fontFamily: fonts.display,
          fontSize: 'clamp(2rem, 3.2vw, 2.8rem)',
          fontWeight: 300,
          lineHeight: 1.1,
          color: colors.ocean800,
          marginBottom: 40,
        }}
      >
        {C.heading}
      </h2>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 32,
          borderBottom: '1px solid rgba(13,31,53,0.12)',
          paddingBottom: 0,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {C.tabs.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '10px 20px',
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                color: active ? colors.ocean800 : '#9e8e76',
                borderBottom: active
                  ? `2px solid ${colors.ocean800}`
                  : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 180ms, border-color 180ms',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Услуга</th>
            <th style={thStyle}>Длительность</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Стоимость (USD)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const isObj = typeof row === 'object' && !Array.isArray(row);
            const name = isObj ? row.name : (row as unknown as string[])[0];
            const duration = isObj
              ? row.duration
              : (row as unknown as string[])[2];

            return (
              <tr
                key={i}
                style={{
                  background:
                    i % 2 === 0 ? 'transparent' : 'rgba(13,31,53,0.025)',
                }}
              >
                <td style={tdStyle}>{name}</td>
                <td style={{ ...tdStyle, color: '#7d6e5a', fontSize: 12 }}>
                  {duration}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <RenderPrice row={row} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Note */}
      <div
        style={{
          marginTop: 20,
          fontFamily: fonts.body,
          fontSize: 12,
          color: '#9e8e76',
          fontStyle: 'italic',
        }}
      >
        {C.note}
      </div>
    </section>
  );
}

/* ── Shared styles ─────────────────────────────────────────────────────────── */

const thStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#9e8e76',
  padding: '0 16px 12px',
  textAlign: 'left',
  borderBottom: '1px solid rgba(13,31,53,0.1)',
};

const tdStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 13,
  color: colors.ocean800,
  padding: '12px 16px',
  borderBottom: '1px solid rgba(13,31,53,0.06)',
  verticalAlign: 'top',
};

const priceNumber: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: 18,
  fontWeight: 500,
};

/* ── Price renderer ────────────────────────────────────────────────────────── */

function RenderPrice({ row }: { row: PriceRow }) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    // Legacy array format
    return (
      <span style={priceNumber}>{(row as unknown as string[])[3]}</span>
    );
  }

  if (row.pricingType === 'fixed') {
    return (
      <span style={priceNumber}>
        {row.priceFixed ? `$${row.priceFixed}` : 'Бесплатно'}
      </span>
    );
  }

  if (row.pricingType === 'person') {
    return (
      <span style={priceNumber}>
        ${row.pricePerPerson}{' '}
        <span
          style={{
            fontFamily: fonts.body,
            fontSize: 11,
            color: '#9e8e76',
            fontWeight: 400,
          }}
        >
          / чел.
        </span>
      </span>
    );
  }

  if (row.pricingType === 'group' && row.tiers) {
    return (
      <div>
        {row.tiers.map((t, ti) => (
          <div
            key={ti}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom:
                ti < (row.tiers?.length ?? 0) - 1 ? 4 : 0,
            }}
          >
            <span
              style={{
                fontFamily: fonts.body,
                fontSize: 11,
                color: '#7d6e5a',
                whiteSpace: 'nowrap',
              }}
            >
              {t.min}–{t.max} чел.
            </span>
            <span style={priceNumber}>${t.price}</span>
          </div>
        ))}
      </div>
    );
  }

  return <span>—</span>;
}
