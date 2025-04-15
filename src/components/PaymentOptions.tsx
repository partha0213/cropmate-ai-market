
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, CreditCard, Wallet, Phone, CheckCircle2 } from 'lucide-react';

interface PaymentOptionsProps {
  amount: number;
  onPaymentComplete?: (method: string, details: any) => void;
  isProcessing?: boolean;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  amount,
  onPaymentComplete,
  isProcessing = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState('cash_on_delivery');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

  // Check for MetaMask availability
  React.useEffect(() => {
    if (window.ethereum) {
      setIsMetaMaskAvailable(true);
    }
  }, []);

  const formatCardNumber = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    return formatted.slice(0, 19); // Limit to 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    
    return digits;
  };

  const validateUpiId = (id: string) => {
    // Basic UPI ID validation
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(id);
  };

  const handleProcessPayment = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (selectedMethod) {
        case 'upi':
          if (!validateUpiId(upiId)) {
            toast.error('Please enter a valid UPI ID');
            return;
          }
          
          // Here you would integrate with a UPI payment gateway
          toast.success('UPI payment initiated successfully');
          if (onPaymentComplete) {
            onPaymentComplete('upi', { upiId });
          }
          break;
          
        case 'card':
          if (
            cardNumber.replace(/\s/g, '').length !== 16 ||
            !expiryDate.includes('/') ||
            cvv.length !== 3 ||
            !nameOnCard
          ) {
            toast.error('Please fill in all card details correctly');
            return;
          }
          
          // Here you would integrate with Stripe or another card processor
          toast.success('Card payment processed successfully');
          if (onPaymentComplete) {
            onPaymentComplete('card', { 
              last4: cardNumber.slice(-4),
              nameOnCard
            });
          }
          break;
          
        case 'crypto':
          // Here you would integrate with MetaMask
          try {
            if (!window.ethereum) {
              throw new Error('MetaMask is not installed');
            }
            
            // Request account access
            const accounts = await window.ethereum.request({ 
              method: 'eth_requestAccounts' 
            });
            
            // In a real implementation, you would request a payment here
            toast.success('Crypto payment completed with MetaMask');
            if (onPaymentComplete) {
              onPaymentComplete('crypto', { 
                wallet: accounts[0],
                method: 'MetaMask' 
              });
            }
          } catch (error) {
            console.error('MetaMask error:', error);
            toast.error('MetaMask transaction failed');
            return;
          }
          break;
          
        case 'cash_on_delivery':
        default:
          // No validation needed for cash on delivery
          toast.success('Cash on delivery selected');
          if (onPaymentComplete) {
            onPaymentComplete('cash_on_delivery', {});
          }
          break;
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
        <CardDescription>
          Choose how you'd like to pay for your order
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <RadioGroup 
          value={selectedMethod} 
          onValueChange={setSelectedMethod}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2 rounded-md border p-4">
            <RadioGroupItem value="cash_on_delivery" id="cod" />
            <Label htmlFor="cod" className="flex flex-1 cursor-pointer items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium leading-none">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                </div>
              </div>
              <CheckCircle2 className={`h-5 w-5 ${selectedMethod === 'cash_on_delivery' ? 'text-green-500' : 'text-transparent'}`} />
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 rounded-md border p-4">
            <RadioGroupItem value="upi" id="upi" />
            <Label htmlFor="upi" className="flex flex-1 cursor-pointer">
              <div className="flex w-full justify-between items-center">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium leading-none">UPI</p>
                    <p className="text-sm text-muted-foreground">Pay using any UPI app</p>
                  </div>
                </div>
                <CheckCircle2 className={`h-5 w-5 ${selectedMethod === 'upi' ? 'text-green-500' : 'text-transparent'}`} />
              </div>
            </Label>
          </div>
          
          {selectedMethod === 'upi' && (
            <div className="pl-6 ml-1 border-l-2 border-gray-200">
              <div className="mb-2">
                <Label htmlFor="upi-id">UPI ID</Label>
                <Input 
                  id="upi-id" 
                  placeholder="username@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2 rounded-md border p-4">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex flex-1 cursor-pointer">
              <div className="flex w-full justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium leading-none">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">Pay with your card</p>
                  </div>
                </div>
                <CheckCircle2 className={`h-5 w-5 ${selectedMethod === 'card' ? 'text-green-500' : 'text-transparent'}`} />
              </div>
            </Label>
          </div>
          
          {selectedMethod === 'card' && (
            <div className="pl-6 ml-1 border-l-2 border-gray-200 space-y-4">
              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <Input 
                  id="card-number" 
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                />
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input 
                    id="expiry" 
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5}
                  />
                </div>
                
                <div className="w-24">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input 
                    id="cvv" 
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    maxLength={3}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="name-on-card">Name on Card</Label>
                <Input 
                  id="name-on-card" 
                  placeholder="John Doe"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {isMetaMaskAvailable && (
            <div className="flex items-center space-x-2 rounded-md border p-4">
              <RadioGroupItem value="crypto" id="crypto" />
              <Label htmlFor="crypto" className="flex flex-1 cursor-pointer items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/assets/metamask-logo.svg" alt="MetaMask" className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium leading-none">Crypto (MetaMask)</p>
                    <p className="text-sm text-muted-foreground">Pay with cryptocurrency</p>
                  </div>
                </div>
                <CheckCircle2 className={`h-5 w-5 ${selectedMethod === 'crypto' ? 'text-green-500' : 'text-transparent'}`} />
              </Label>
            </div>
          )}
        </RadioGroup>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-xl font-bold">₹{amount.toFixed(2)}</div>
        
        <Button 
          onClick={handleProcessPayment}
          disabled={isSubmitting || isProcessing}
        >
          {isSubmitting || isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ₹${amount.toFixed(2)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Add MetaMask type definition for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

export default PaymentOptions;
