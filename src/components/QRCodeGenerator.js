import React from 'react';
import QRCode from 'qrcode.react';

const QRCodeGenerator = ({ url }) => (
  <div>
    <QRCode value={url} />
    <p>Scan the QR code to submit a song request!</p>
  </div>
);

export default QRCodeGenerator;
