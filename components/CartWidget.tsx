'use client';

import { useCart } from '@/lib/cart';
import {
  getCartItemPrice,
  pricingTag,
  isGuideRow,
  formatDuration,
} from '@/lib/pricing';

export default function CartWidget() {
  const {
    cart,
    groupSize,
    priceMap,
    tours,
    cartTotal,
    cartTotalHours,
    timeOverload,
    guideConflict,
    removeCartItem,
    clearCart,
    cartModalOpen,
    setCartModalOpen,
    form,
    setForm,
    submitted,
    setSubmitted,
  } = useCart();

  if (cart.length === 0 && !cartModalOpen) return null;

  const PRICE_MAP = priceMap;
  const TOURS = tours;
  const days = groupSize.days || 1;

  const cartItems = cart
    .map(item => {
      const tour = TOURS.find(t => t.id === item.tourId);
      if (!tour) return null;
      const pd = item.variantKey ? PRICE_MAP[item.variantKey] : null;
      const price = getCartItemPrice(item, groupSize, PRICE_MAP, TOURS);
      const tag = pricingTag(item, groupSize, PRICE_MAP, TOURS);
      const name = pd?.name || tour.title;
      const note = pd?.note || (tour.priceModel === 'person' ? 'за чел.' : 'до 3 чел.');
      return { item, tour, name, price, tag, note };
    })
    .filter(Boolean) as Array<{
    item: (typeof cart)[number];
    tour: (typeof TOURS)[number];
    name: string;
    price: number;
    tag: string;
    note: string;
  }>;

  return (
    <>
      {/* Sticky cart bar */}
      {cart.length > 0 && !cartModalOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 150,
            background: '#0d1f35',
            borderTop: '1px solid rgba(248,245,240,0.1)',
            boxShadow: '0 -4px 32px rgba(6,14,24,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            padding: '14px clamp(20px,6vw,80px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#c4703f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Lora',serif",
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#f8f5f0',
                  flexShrink: 0,
                }}
              >
                {cart.length}
              </div>
              <span
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 12,
                  color: 'rgba(248,245,240,0.75)',
                  letterSpacing: '0.04em',
                }}
              >
                {cart.length === 1
                  ? 'активность'
                  : cart.length < 5
                    ? 'активности'
                    : 'активностей'}
              </span>
            </div>
            {cartTotalHours > 0 && (
              <>
                <div
                  style={{
                    width: 1,
                    height: 20,
                    background: 'rgba(248,245,240,0.12)',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 11, opacity: 0.45 }}>⏱</span>
                  <span
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 12,
                      color: 'rgba(248,245,240,0.6)',
                    }}
                  >
                    {formatDuration(cartTotalHours)}
                  </span>
                </div>
              </>
            )}
            <div
              style={{
                width: 1,
                height: 20,
                background: 'rgba(248,245,240,0.12)',
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond',Georgia,serif",
                  fontSize: 22,
                  fontWeight: 500,
                  color: '#f8f5f0',
                  lineHeight: 1,
                }}
              >
                от ${cartTotal.toLocaleString()}
              </span>
              <span
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 10,
                  color: 'rgba(248,245,240,0.4)',
                  marginLeft: 8,
                }}
              >
                {(groupSize.adults || 0) > 0 && `${groupSize.adults} взр.`}
                {(groupSize.adults || 0) > 0 && (groupSize.children || 0) > 0
                  ? ' + '
                  : ''}
                {(groupSize.children || 0) > 0 && `${groupSize.children} дет.`}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => clearCart()}
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 11,
                color: 'rgba(248,245,240,0.45)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 0',
                letterSpacing: '0.04em',
              }}
            >
              Очистить
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setCartModalOpen(true);
              }}
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '11px 24px',
                borderRadius: 2,
                border: 'none',
                cursor: 'pointer',
                background: '#c4703f',
                color: '#f8f5f0',
                whiteSpace: 'nowrap',
              }}
            >
              Запросить стоимость →
            </button>
          </div>
        </div>
      )}

      {/* Cart modal */}
      {cartModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(6,14,24,0.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(16px,4vw,32px)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setCartModalOpen(false)}
        >
          <div
            style={{
              background: '#f8f5f0',
              borderRadius: 4,
              maxWidth: 540,
              width: '100%',
              boxShadow: '0 16px 64px rgba(6,14,24,0.4)',
              overflow: 'hidden',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                padding: '24px 24px 18px',
                borderBottom: '1px solid rgba(13,31,53,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "'Lora',serif",
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#c4703f',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Конструктор тура
                </span>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond',Georgia,serif",
                    fontSize: 24,
                    fontWeight: 300,
                    color: '#0d1f35',
                    lineHeight: 1.1,
                  }}
                >
                  Запрос на котировку
                </h3>
              </div>
              <button
                onClick={() => setCartModalOpen(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(13,31,53,0.07)',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#0d1f35',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                ✕
              </button>
            </div>
            {!submitted ? (
              <>
                <div
                  style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid rgba(13,31,53,0.08)',
                  }}
                >
                  {/* Group composition */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'rgba(13,31,53,0.04)',
                      borderRadius: 2,
                      border: '1px solid rgba(13,31,53,0.08)',
                      marginBottom: 18,
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Lora',serif",
                        fontSize: 12,
                        color: '#5c5040',
                        fontWeight: 500,
                      }}
                    >
                      Состав группы
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        gap: 16,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      {(groupSize.adults || 0) > 0 && (
                        <span
                          style={{
                            fontFamily: "'Lora',serif",
                            fontSize: 12,
                            color: '#0d1f35',
                            fontWeight: 600,
                          }}
                        >
                          {groupSize.adults} взрослых
                        </span>
                      )}
                      {(groupSize.children || 0) > 0 && (
                        <span
                          style={{
                            fontFamily: "'Lora',serif",
                            fontSize: 12,
                            color: '#0d1f35',
                            fontWeight: 600,
                          }}
                        >
                          {groupSize.children} детей
                        </span>
                      )}
                      {(groupSize.adults || 0) === 0 &&
                        (groupSize.children || 0) === 0 && (
                          <span
                            style={{
                              fontFamily: "'Lora',serif",
                              fontSize: 11,
                              color: '#9e8e76',
                            }}
                          >
                            не указано
                          </span>
                        )}
                      <span
                        style={{
                          width: 1,
                          height: 14,
                          background: 'rgba(13,31,53,0.15)',
                          display: 'inline-block',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: 12,
                          color: '#0d1f35',
                        }}
                      >
                        {groupSize.days || 1}{' '}
                        {(groupSize.days || 1) === 1
                          ? 'день'
                          : (groupSize.days || 1) < 5
                            ? 'дня'
                            : 'дней'}{' '}
                        в Ушуайе
                      </span>
                    </div>
                  </div>

                  {/* Warnings */}
                  {(timeOverload || guideConflict) && (
                    <div
                      style={{
                        marginBottom: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      {timeOverload && (
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: 4,
                            background: '#fefce8',
                            border: '1px solid #fbbf24',
                            display: 'flex',
                            gap: 10,
                            alignItems: 'flex-start',
                          }}
                        >
                          <span style={{ fontSize: 16, flexShrink: 0 }}>⏱</span>
                          <div>
                            <div
                              style={{
                                fontFamily: "'Lora',serif",
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#92400e',
                                marginBottom: 2,
                              }}
                            >
                              Возможно, не влезает в {days}{' '}
                              {days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}
                            </div>
                            <div
                              style={{
                                fontFamily: "'Lora',serif",
                                fontSize: 11,
                                lineHeight: 1.6,
                                color: '#b45309',
                              }}
                            >
                              Суммарное время экскурсий — {formatDuration(cartTotalHours)}, а
                              с учётом переездов и пауз некоторые активности лучше разнести по
                              дням. Менеджер поможет составить маршрут.
                            </div>
                          </div>
                        </div>
                      )}
                      {guideConflict && (
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: 4,
                            background: '#fff7ed',
                            border: '1px solid #fdba74',
                            display: 'flex',
                            gap: 10,
                            alignItems: 'flex-start',
                          }}
                        >
                          <span style={{ fontSize: 16, flexShrink: 0 }}>🧭</span>
                          <div>
                            <div
                              style={{
                                fontFamily: "'Lora',serif",
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#9a3412',
                                marginBottom: 2,
                              }}
                            >
                              Несколько услуг гида в один день
                            </div>
                            <div
                              style={{
                                fontFamily: "'Lora',serif",
                                fontSize: 11,
                                lineHeight: 1.6,
                                color: '#c2410c',
                              }}
                            >
                              Если экскурсии проходят в один день — гид сопровождает группу
                              весь день и оплачивается единожды. Уточните детали с менеджером
                              при оформлении.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#9e8e76',
                      marginBottom: 10,
                    }}
                  >
                    Выбранные активности
                  </div>

                  {cartItems.map(({ item, tour: t, name, price, tag, note }) => {
                    const isTicketItem =
                      PRICE_MAP[item.variantKey!]?.pricingType === 'tickets';
                    const isGuide = isGuideRow(
                      PRICE_MAP[item.variantKey!],
                    );
                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: '9px 0',
                          borderBottom: '1px solid rgba(13,31,53,0.06)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: 12,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontFamily: "'Lora',serif",
                                fontSize: 13,
                                color: '#0d1f35',
                                fontWeight: 500,
                                lineHeight: 1.3,
                              }}
                            >
                              {isTicketItem && (
                                <span style={{ marginRight: 5 }}>🎫</span>
                              )}
                              {isGuide && (
                                <span style={{ marginRight: 4 }}>🧭</span>
                              )}
                              {name !== t.title ? (
                                <>
                                  <span
                                    style={{ color: '#9e8e76', fontSize: 11 }}
                                  >
                                    {t.title} ·{' '}
                                  </span>
                                  {name}
                                </>
                              ) : (
                                name
                              )}
                            </div>
                            <div
                              style={{
                                fontFamily: "'Lora',serif",
                                fontSize: 10,
                                color: '#9e8e76',
                                marginTop: 3,
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    note === 'за чел.'
                                      ? '#c4703f'
                                      : 'rgba(13,31,53,0.4)',
                                  fontWeight:
                                    note === 'за чел.' ? 600 : 400,
                                }}
                              >
                                {note}
                              </span>
                              <span
                                style={{
                                  marginLeft: 6,
                                  color: 'rgba(13,31,53,0.3)',
                                }}
                              >
                                {tag}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              flexShrink: 0,
                            }}
                          >
                            <span
                              style={{
                                fontFamily:
                                  "'Cormorant Garamond',Georgia,serif",
                                fontSize: 18,
                                fontWeight: 500,
                                color: '#0d1f35',
                              }}
                            >
                              ${price.toLocaleString()}
                            </span>
                            <button
                              onClick={() => removeCartItem(item.id)}
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                background: 'rgba(13,31,53,0.08)',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#7d6e5a',
                                fontSize: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Total row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      paddingTop: 14,
                      marginTop: 4,
                      gap: 12,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: 11,
                          color: '#7d6e5a',
                        }}
                      >
                        Итого ориентировочно
                      </span>
                      {cartTotalHours > 0 && (
                        <div
                          style={{
                            fontFamily: "'Lora',serif",
                            fontSize: 10,
                            color: '#9e8e76',
                            marginTop: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span>⏱</span>
                          {formatDuration(cartTotalHours)}
                        </div>
                      )}
                      <div
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: 10,
                          color: '#9e8e76',
                          fontStyle: 'italic',
                          marginTop: 2,
                        }}
                      >
                        Точная цена — после уточнения деталей
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span
                        style={{
                          fontFamily: "'Cormorant Garamond',Georgia,serif",
                          fontSize: 28,
                          fontWeight: 500,
                          color: '#0d1f35',
                          lineHeight: 1,
                        }}
                      >
                        от ${cartTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '20px 24px 24px' }}>
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#9e8e76',
                      marginBottom: 16,
                    }}
                  >
                    Ваши данные
                  </div>
                  {(
                    [
                      {
                        key: 'name' as const,
                        label: 'Имя',
                        placeholder: 'Как вас зовут?',
                      },
                      {
                        key: 'contact' as const,
                        label: 'WhatsApp / Email',
                        placeholder: '+54 ... или email',
                      },
                      {
                        key: 'arrival' as const,
                        label: 'Дата прилёта',
                        placeholder: 'Примерно когда',
                      },
                      {
                        key: 'departure' as const,
                        label: 'Дата отплытия / отъезда',
                        placeholder: 'Примерно когда',
                      },
                    ] as const
                  ).map(field => (
                    <div key={field.key} style={{ marginBottom: 14 }}>
                      <label
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#7d6e5a',
                          display: 'block',
                          marginBottom: 5,
                        }}
                      >
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={form[field.key]}
                        onChange={e =>
                          setForm({ ...form, [field.key]: e.target.value })
                        }
                        placeholder={field.placeholder}
                        style={{
                          width: '100%',
                          fontFamily: "'Lora',serif",
                          fontSize: 13,
                          color: '#0d1f35',
                          background: '#fff',
                          border: '1px solid rgba(13,31,53,0.18)',
                          borderRadius: 2,
                          padding: '10px 12px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  ))}
                  <div style={{ marginBottom: 20 }}>
                    <label
                      style={{
                        fontFamily: "'Lora',serif",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#7d6e5a',
                        display: 'block',
                        marginBottom: 5,
                      }}
                    >
                      Комментарий
                    </label>
                    <textarea
                      value={form.comment}
                      onChange={e =>
                        setForm({ ...form, comment: e.target.value })
                      }
                      placeholder="Пожелания, особые запросы, вопросы..."
                      rows={3}
                      style={{
                        width: '100%',
                        fontFamily: "'Lora',serif",
                        fontSize: 13,
                        color: '#0d1f35',
                        background: '#fff',
                        border: '1px solid rgba(13,31,53,0.18)',
                        borderRadius: 2,
                        padding: '10px 12px',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                  {/* Manager note */}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 4,
                      background: 'rgba(13,31,53,0.04)',
                      border: '1px solid rgba(13,31,53,0.08)',
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Lora',serif",
                        fontSize: 11,
                        color: '#5c5040',
                        lineHeight: 1.65,
                      }}
                    >
                      <strong>Детали уточним с менеджером:</strong> порядок экскурсий,
                      совместимость по времени, оплата гида на несколько дней — всё это
                      обсудим после получения заявки и скорректируем итоговую стоимость.
                    </div>
                  </div>
                  <button
                    disabled={!form.name || !form.contact}
                    onClick={() => setSubmitted(true)}
                    style={{
                      width: '100%',
                      fontFamily: "'Lora',serif",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '14px',
                      borderRadius: 2,
                      border: 'none',
                      cursor:
                        form.name && form.contact ? 'pointer' : 'not-allowed',
                      background:
                        form.name && form.contact
                          ? '#c4703f'
                          : 'rgba(196,112,63,0.35)',
                      color: '#f8f5f0',
                      transition: 'background 200ms',
                    }}
                  >
                    Отправить запрос
                  </button>
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 10,
                      color: '#9e8e76',
                      textAlign: 'center',
                      marginTop: 10,
                      fontStyle: 'italic',
                    }}
                  >
                    Ответим в WhatsApp или email в течение нескольких часов
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '48px 32px', textAlign: 'center' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(196,112,63,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: 24,
                  }}
                >
                  ✓
                </div>
                <h4
                  style={{
                    fontFamily: "'Cormorant Garamond',Georgia,serif",
                    fontSize: 26,
                    fontWeight: 300,
                    color: '#0d1f35',
                    marginBottom: 10,
                  }}
                >
                  Запрос отправлен
                </h4>
                <p
                  style={{
                    fontFamily: "'Lora',serif",
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: '#7d6e5a',
                    marginBottom: 28,
                  }}
                >
                  Свяжемся с вами в WhatsApp или email, уточним детали и рассчитаем точную
                  стоимость.
                </p>
                <button
                  onClick={() => {
                    setCartModalOpen(false);
                    clearCart();
                    setForm({
                      name: '',
                      contact: '',
                      arrival: '',
                      departure: '',
                      comment: '',
                    });
                  }}
                  style={{
                    fontFamily: "'Lora',serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '12px 28px',
                    borderRadius: 2,
                    border: 'none',
                    cursor: 'pointer',
                    background: '#0d1f35',
                    color: '#f8f5f0',
                  }}
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
