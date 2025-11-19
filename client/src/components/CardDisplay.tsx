import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Card as CardType, Account } from "@shared/schema";

interface CardDisplayProps {
  card: CardType;
  account?: Account;
  index: number;
}

function getCardBrandLogo(brand: string) {
  switch (brand?.toLowerCase()) {
    case 'visa':
      return (
        <svg className="h-10 w-auto" viewBox="0 0 141.732 141.732" fill="white">
          <path d="M62.935 89.571h-9.733l6.083-37.384h9.734zM45.014 52.187L35.735 77.9l-1.098-5.537.001.002-3.275-16.812s-.396-3.366-4.617-3.366h-15.34l-.18.633s4.691.976 10.181 4.273l8.456 32.479h10.141l15.485-37.385H45.014zM121.569 89.571h8.937l-7.792-37.385h-7.824c-3.613 0-4.493 2.786-4.493 2.786L95.881 89.571h10.146l2.029-5.553h12.373l1.14 5.553zm-10.71-13.224l5.114-13.99 2.877 13.99h-7.991zM96.642 61.177l1.389-8.028s-4.286-1.63-8.754-1.63c-4.83 0-16.3 2.111-16.3 12.376 0 9.658 13.462 9.778 13.462 14.851s-12.075 4.164-16.06.965l-1.447 8.394s4.346 2.111 10.986 2.111c6.64 0 16.662-3.439 16.662-12.799 0-9.72-13.583-10.625-13.583-14.851.001-4.227 9.48-3.684 13.645-1.389z"/>
        </svg>
      );
    case 'mastercard':
      return (
        <svg className="h-10 w-auto" viewBox="0 0 131.39 86.9" fill="none">
          <rect x="48.37" y="15.14" width="34.66" height="56.61" fill="#FF5F00"/>
          <circle cx="43.45" cy="43.45" r="43.45" fill="#EB001B" fillOpacity="0.8"/>
          <circle cx="87.94" cy="43.45" r="43.45" fill="#F79E1B" fillOpacity="0.8"/>
        </svg>
      );
    case 'amex':
    case 'american express':
      return (
        <svg className="h-10 w-auto" viewBox="0 0 50 50" fill="white">
          <text x="0" y="35" fontSize="16" fontWeight="bold" fontFamily="Arial">AMEX</text>
        </svg>
      );
    case 'discover':
      return (
        <svg className="h-10 w-auto" viewBox="0 0 50 50" fill="white">
          <text x="0" y="35" fontSize="12" fontWeight="bold" fontFamily="Arial">DISCOVER</text>
        </svg>
      );
    default:
      return (
        <svg className="h-10 w-auto" viewBox="0 0 50 50" fill="white">
          <rect x="5" y="15" width="40" height="20" rx="2" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
      );
  }
}

function getCardBrandGradient(brand: string, cardType: string) {
  const brandLower = brand?.toLowerCase();
  
  if (cardType === 'credit') {
    switch (brandLower) {
      case 'visa':
        return 'bg-gradient-to-br from-[#1A1F71] via-[#0F3460] to-[#16213E]';
      case 'mastercard':
        // Dark background like real Mastercard cards
        return 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419]';
      case 'amex':
      case 'american express':
        return 'bg-gradient-to-br from-[#006FCF] via-[#00A2E5] to-[#0077C8]';
      case 'discover':
        return 'bg-gradient-to-br from-[#FF6000] via-[#FFA500] to-[#FF8C00]';
      default:
        return 'bg-gradient-to-br from-primary via-primary/90 to-primary/80';
    }
  } else {
    // Debit cards - slightly different shades
    switch (brandLower) {
      case 'visa':
        return 'bg-gradient-to-br from-[#2E3192] via-[#1A237E] to-[#0D47A1]';
      case 'mastercard':
        // Very dark background for Mastercard debit (almost black)
        return 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419]';
      case 'amex':
      case 'american express':
        return 'bg-gradient-to-br from-[#00838F] via-[#00ACC1] to-[#0097A7]';
      case 'discover':
        return 'bg-gradient-to-br from-[#E65100] via-[#F57C00] to-[#FB8C00]';
      default:
        return 'bg-gradient-to-br from-chart-1 via-chart-1/90 to-chart-1/80';
    }
  }
}

function formatCardNumber(number: string, brand: string) {
  // Amex uses 4-6-5 format, others use 4-4-4-4
  if (brand?.toLowerCase() === 'amex' || brand?.toLowerCase() === 'american express') {
    return number.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  }
  return number.match(/.{1,4}/g)?.join(' ') || number;
}

export default function CardDisplay({ card, account, index }: CardDisplayProps) {
  const [isCvvVisible, setIsCvvVisible] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <Card
      className={`${getCardBrandGradient(card.cardBrand, card.cardType)} text-white border-0 overflow-hidden relative`}
      data-testid={`card-${index}`}
    >
      {/* Card chip graphic */}
      <div className="absolute top-[3.5rem] left-5 w-10 h-8 rounded opacity-60">
        <svg viewBox="0 0 40 30" fill="none">
          <rect width="40" height="30" rx="3" fill="url(#chipGradient)" />
          <defs>
            <linearGradient id="chipGradient" x1="0" y1="0" x2="40" y2="30">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FFA500" />
            </linearGradient>
          </defs>
          <rect x="8" y="6" width="8" height="6" fill="#DAA520" opacity="0.5" />
          <rect x="24" y="6" width="8" height="6" fill="#DAA520" opacity="0.5" />
          <rect x="8" y="18" width="8" height="6" fill="#DAA520" opacity="0.5" />
          <rect x="24" y="18" width="8" height="6" fill="#DAA520" opacity="0.5" />
        </svg>
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
        }} />
      </div>

      <div className="relative p-4 space-y-2.5">
        {/* Card Header - Bank Logo */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-bold tracking-tight text-white">Fundamental</h2>
              <h2 className="text-sm font-bold tracking-tight -mt-0.5 text-white">Financial Credit</h2>
            </div>
            <p className="text-[8px] text-white/70 uppercase tracking-wider mt-1">
              {card.cardType === 'credit' ? 'Credit Card' : 'Debit Card'}
            </p>
            {account && (
              <p className="text-[8px] text-white/60 mt-0.5">
                {account.region === 'AU' && 'Australia'}
                {account.region === 'US' && 'United States'}
                {account.region === 'NZ' && 'New Zealand'}
              </p>
            )}
          </div>
          <Badge
            variant={card.isActive ? "default" : "secondary"}
            className="bg-white/20 text-white border-0 text-xs"
            data-testid={`badge-status-${index}`}
          >
            {card.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Card Number */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p
              className="text-lg font-mono tracking-[0.12em] font-light text-white"
              data-testid={`text-card-number-${index}`}
            >
              {formatCardNumber(card.cardNumber, card.cardBrand)}
            </p>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-white hover:bg-white/20"
              onClick={() => copyToClipboard(card.cardNumber, 'Card number')}
              data-testid={`button-copy-card-number-${index}`}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Card Details with Brand Logo */}
        <div className="flex items-end justify-between">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-0.5">
              <p className="text-[8px] text-white/60 uppercase tracking-wider">Cardholder</p>
              <p className="text-[11px] font-medium truncate max-w-[90px] text-white" data-testid={`text-cardholder-${index}`}>
                {card.cardholderName}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[8px] text-white/60 uppercase tracking-wider">Valid Thru</p>
              <p className="text-[11px] font-mono text-white" data-testid={`text-expiry-${index}`}>
                {card.expiryMonth}/{card.expiryYear.slice(-2)}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[8px] text-white/60 uppercase tracking-wider">CVV</p>
              <div className="flex items-center gap-1">
                <p className="text-[11px] font-mono text-white" data-testid={`text-cvv-${index}`}>
                  {isCvvVisible ? card.cvv : '•••'}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 text-white hover:bg-white/20"
                  onClick={() => setIsCvvVisible(!isCvvVisible)}
                  data-testid={`button-toggle-cvv-${index}`}
                >
                  {isCvvVisible ? (
                    <EyeOff className="h-2.5 w-2.5" />
                  ) : (
                    <Eye className="h-2.5 w-2.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Brand Logo - Bottom Right */}
          <div>
            {getCardBrandLogo(card.cardBrand)}
          </div>
        </div>

        {/* Account Info */}
        {account && (
          <div className="pt-2 border-t border-white/20">
            <p className="text-[8px] text-white/60 uppercase tracking-wider mb-0.5">Linked Account</p>
            <div className="flex items-center justify-between text-[11px]">
              <p className="font-mono text-white" data-testid={`text-linked-account-${index}`}>
                {account.accountNumber.slice(0, 4)}...{account.accountNumber.slice(-4)}
              </p>
              <p className="text-[10px] text-white/70">
                {account.region === 'AU' && account.bsb && `BSB: ${account.bsb.slice(0, 3)}-${account.bsb.slice(3)}`}
                {account.region === 'US' && account.routingNumber && `Routing: ${account.routingNumber}`}
                {account.region === 'NZ' && account.swiftCode && `SWIFT: ${account.swiftCode}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
