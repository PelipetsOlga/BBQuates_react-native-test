import type { Death } from './Death';

export type Character = {
  name: string;
  birthday: string;
  occupations: string[];
  /** Photo URLs; the first one is the character card's photo. */
  images: string[];
  aliases: string[];
  status: string;
  portrayedBy: string;
  /** Filled from `GET /deaths` after the character loads; absent when they have no death. */
  death?: Death;
};

/** An element of `GET /characters`. */
export type CharacterDto = {
  name: string;
  birthday: string;
  occupations: string[];
  images: string[];
  aliases: string[];
  status: string;
  portrayed_by: string;
};

export function toCharacter(dto: CharacterDto): Character {
  return {
    name: dto.name,
    birthday: dto.birthday,
    occupations: dto.occupations,
    images: dto.images,
    aliases: dto.aliases,
    status: dto.status,
    portrayedBy: dto.portrayed_by,
  };
}
