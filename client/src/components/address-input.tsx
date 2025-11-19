import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AddressInputProps {
  country: string;
  postalCode: string;
  city: string;
  state: string;
  addressLine1?: string;
  addressLine2?: string;
  onPostalCodeChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onAddressLine1Change?: (value: string) => void;
  onAddressLine2Change?: (value: string) => void;
  onCountryChange?: (value: string) => void;
  disabled?: boolean;
  showAddress?: boolean;
  showCountry?: boolean;
}

interface PostalCodeResponse {
  country: string;
  "country abbreviation": string;
  places: Array<{
    "place name": string;
    state: string;
    "state abbreviation": string;
  }>;
}

export function AddressInput({
  country,
  postalCode,
  city,
  state,
  addressLine1 = "",
  addressLine2 = "",
  onPostalCodeChange,
  onCityChange,
  onStateChange,
  onAddressLine1Change,
  onAddressLine2Change,
  onCountryChange,
  disabled = false,
  showAddress = true,
  showCountry = true,
}: AddressInputProps) {
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    const lookupPostalCode = async () => {
      if (!postalCode || postalCode.length < 4) {
        return;
      }

      setIsLookingUp(true);
      setLookupError(null);

      try {
        let countryCode = country.toUpperCase();
        
        // Map country names to codes if needed
        if (country === "Australia") countryCode = "AU";
        if (country === "United States" || country === "USA") countryCode = "US";
        if (country === "New Zealand") countryCode = "NZ";

        // Use Zippopotam.us free API - no API key required
        const response = await fetch(
          `https://api.zippopotam.us/${countryCode}/${postalCode.replace(/\s/g, "")}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setLookupError("Postal code not found");
          } else {
            setLookupError("Unable to lookup postal code");
          }
          setIsLookingUp(false);
          return;
        }

        const data: PostalCodeResponse = await response.json();

        console.log("Postal code lookup result:", data);

        if (data.places && data.places.length > 0) {
          const place = data.places[0];
          
          console.log("Setting city to:", place["place name"]);
          console.log("Setting state to:", place["state abbreviation"] || place.state);
          
          // Auto-fill city and state
          onCityChange(place["place name"]);
          onStateChange(place["state abbreviation"] || place.state);
          
          setLookupError(null);
        }
      } catch (error) {
        console.error("Postal code lookup error:", error);
        setLookupError("Unable to lookup postal code");
      } finally {
        setIsLookingUp(false);
      }
    };

    // Debounce the lookup
    const timer = setTimeout(() => {
      lookupPostalCode();
    }, 500);

    return () => clearTimeout(timer);
  }, [postalCode, country, onCityChange, onStateChange]);

  return (
    <div className="space-y-4">
      {showCountry && onCountryChange && (
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <select
            id="country"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            disabled={disabled}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="select-country"
          >
            <option value="">Select Country</option>
            <option value="Australia">Australia</option>
            <option value="United States">United States</option>
            <option value="New Zealand">New Zealand</option>
          </select>
        </div>
      )}

      {showAddress && onAddressLine1Change && (
        <>
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              value={addressLine1}
              onChange={(e) => onAddressLine1Change(e.target.value)}
              placeholder="Street address"
              disabled={disabled}
              data-testid="input-address-line1"
            />
          </div>

          {onAddressLine2Change && (
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                value={addressLine2}
                onChange={(e) => onAddressLine2Change(e.target.value)}
                placeholder="Apartment, suite, etc."
                disabled={disabled}
                data-testid="input-address-line2"
              />
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="flex items-center gap-2">
            {country === "United States" ? "ZIP Code" : "Postal Code"}
            {isLookingUp && <Loader2 className="w-3 h-3 animate-spin" />}
          </Label>
          <Input
            id="postalCode"
            value={postalCode}
            onChange={(e) => onPostalCodeChange(e.target.value)}
            placeholder={country === "United States" ? "12345" : "1234"}
            disabled={disabled}
            data-testid="input-postal-code"
          />
          {lookupError && (
            <p className="text-xs text-muted-foreground">{lookupError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="City"
            disabled={disabled}
            data-testid="input-city"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="state">
          {country === "United States" ? "State" : "State/Province"}
        </Label>
        <Input
          id="state"
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
          placeholder={country === "United States" ? "CA" : "State"}
          disabled={disabled}
          data-testid="input-state"
        />
      </div>
    </div>
  );
}
