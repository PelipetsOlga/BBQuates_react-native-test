export type Episode = {
  /** Season digit followed by the episode number, e.g. `101`. */
  episode: number;
  title: string;
  image: string;
  synopsis: string;
  writtenBy: string;
  directedBy: string;
  airDate: string;
};

/** An element of `GET /episodes`. */
export type EpisodeDto = {
  episode: number;
  title: string;
  image: string;
  synopsis: string;
  written_by: string;
  directed_by: string;
  air_date: string;
};

export function toEpisode(dto: EpisodeDto): Episode {
  return {
    episode: dto.episode,
    title: dto.title,
    image: dto.image,
    synopsis: dto.synopsis,
    writtenBy: dto.written_by,
    directedBy: dto.directed_by,
    airDate: dto.air_date,
  };
}

/**
 * `101` → "Season 1 Episode 1", `110` → "Season 1 Episode 10". Same rule as the original's
 * `seasonEpisod`: the first digit is the season; a leading zero in the rest keeps only its last digit.
 */
export function formatSeasonEpisode(episode: number): string {
  const digits = String(episode);
  const season = digits.slice(0, 1);
  let number = digits.slice(1);

  if (number.startsWith('0')) {
    number = number.slice(-1);
  }

  return `Season ${season} Episode ${number}`;
}
