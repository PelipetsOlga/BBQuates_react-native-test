export type Death = {
  character: string;
  image: string;
  details: string;
  lastWords: string;
};

/** An element of `GET /deaths`. */
export type DeathDto = {
  character: string;
  image: string;
  details: string;
  last_words: string;
};

export function toDeath(dto: DeathDto): Death {
  return {
    character: dto.character,
    image: dto.image,
    details: dto.details,
    lastWords: dto.last_words,
  };
}
