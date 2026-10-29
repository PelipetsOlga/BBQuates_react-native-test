export type Quote = {
  quote: string;
  character: string;
};

/** `GET /quotes/random` — only the fields the app reads. */
export type QuoteDto = {
  quote: string;
  character: string;
};

export function toQuote(dto: QuoteDto): Quote {
  return { quote: dto.quote, character: dto.character };
}
