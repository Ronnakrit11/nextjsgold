import { NextResponse } from 'next/server';

const API_URL = 'https://developer.easyslip.com/api/v1/verify';
const API_KEY = process.env.EASYSLIP_API_KEY;

// Expected receiver details
const EXPECTED_RECEIVER = {
  name: {
    th: "นาย รนกฤต เ",
    en: "MR. RONNAKRIT C"
  },
  account: "XXX-X-XX271-7",
  type: "BANKAC"
};

if (!API_KEY) {
  throw new Error('EASYSLIP_API_KEY not configured');
}

// Define response type according to EasySlip API
type EasySlipResponse = {
  status: number;
  data?: {
    payload: string;
    transRef: string;
    date: string;
    countryCode: string;
    amount: {
      amount: number;
      local: {
        amount?: number;
        currency?: string;
      };
    };
    fee?: number;
    ref1?: string;
    ref2?: string;
    ref3?: string;
    sender: {
      bank: {
        id: string;
        name?: string;
        short?: string;
      };
      account: {
        name: {
          th?: string;
          en?: string;
        };
        bank?: {
          type: 'BANKAC' | 'TOKEN' | 'DUMMY';
          account: string;
        };
        proxy?: {
          type: 'NATID' | 'MSISDN' | 'EWALLETID' | 'EMAIL' | 'BILLERID';
          account: string;
        };
      };
    };
    receiver: {
      bank: {
        id: string;
        name?: string;
        short?: string;
      };
      account: {
        name: {
          th?: string;
          en?: string;
        };
        bank?: {
          type: 'BANKAC' | 'TOKEN' | 'DUMMY';
          account: string;
        };
        proxy?: {
          type: 'NATID' | 'MSISDN' | 'EWALLETID' | 'EMAIL' | 'BILLERID';
          account: string;
        };
      };
      merchantId?: string;
    };
  };
  message?: string;
}

function validateReceiver(data: EasySlipResponse): boolean {
  if (!data.data?.receiver?.account) {
    return false;
  }

  const receiver = data.data.receiver.account;

  // Check receiver name (both Thai and English)
  if (receiver.name?.th !== EXPECTED_RECEIVER.name.th || 
      receiver.name?.en !== EXPECTED_RECEIVER.name.en) {
    return false;
  }

  // Check bank account type and number
  if (receiver.bank?.type !== EXPECTED_RECEIVER.type || 
      receiver.bank?.account !== EXPECTED_RECEIVER.account) {
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('slip') as File;

    if (!file) {
      return NextResponse.json(
        { status: 400, message: 'invalid_payload' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { status: 400, message: 'image_size_too_large' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { status: 400, message: 'invalid_image' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        image: base64
      }),
      cache: 'no-store',
    });

    const data: EasySlipResponse = await response.json();

    // Handle different response statuses
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Validate receiver information
    if (!validateReceiver(data)) {
      return NextResponse.json(
        { 
          status: 400, 
          message: 'invalid_receiver',
          details: 'Transfer must be to นาย รนกฤต เ account only'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error verifying slip:', error);
    return NextResponse.json(
      { status: 500, message: 'server_error' },
      { status: 500 }
    );
  }
}