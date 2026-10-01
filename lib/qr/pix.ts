// BR Code (EMV MPM) estático según el manual del Banco Central de Brasil

const tlv = (id: string, value: string) => `${id}${value.length.toString().padStart(2, '0')}${value}`;

// el estándar solo admite ASCII básico en nombre y ciudad
const ascii = (s: string, max: number) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '').trim().slice(0, max);

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixInput {
  key: string;
  name: string;
  city: string;
  amount?: string;
  txid?: string;
  info?: string;
}

export function pixPayload({ key, name, city, amount, txid, info }: PixInput) {
  const account = tlv('00', 'br.gov.bcb.pix') + tlv('01', key.trim()) + (info ? tlv('02', ascii(info, 40)) : '');
  const ref = (txid ?? '').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***';

  let payload =
    tlv('00', '01') +
    tlv('26', account) +
    tlv('52', '0000') +
    tlv('53', '986') +
    (amount ? tlv('54', Number(amount).toFixed(2)) : '') +
    tlv('58', 'BR') +
    tlv('59', ascii(name, 25)) +
    tlv('60', ascii(city, 15)) +
    tlv('62', tlv('05', ref)) +
    '6304';

  payload += crc16(payload);
  return payload;
}
