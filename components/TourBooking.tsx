'use client';

import { useState } from 'react';
import type { Tour } from '@/types';
import { colors, fonts } from '@/lib/brand';
import TourModal from '@/components/TourModal';

export default function TourBooking({ tour }: { tour: Tour }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          fontFamily: fonts.body,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '14px 0',
          background: colors.terra500,
          color: colors.earth100,
          borderRadius: 2,
          border: 'none',
          width: '100%',
          cursor: 'pointer',
          transition: 'opacity 200ms',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        }}
      >
        {'Выбрать опции'}
      </button>
      {showModal && (
        <TourModal tour={tour} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
