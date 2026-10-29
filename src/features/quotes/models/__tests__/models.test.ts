import characterFixture from '../../__fixtures__/samplecharacter.json';
import deathFixture from '../../__fixtures__/sampledeath.json';
import episodeFixture from '../../__fixtures__/sampleepisode.json';
import quoteFixture from '../../__fixtures__/samplequote.json';
import {
  formatSeasonEpisode,
  SHOW_KEYS,
  SHOWS,
  toCharacter,
  toDeath,
  toEpisode,
  toQuote,
} from '#/features/quotes/models';

describe('mappers', () => {
  it('maps a quote', () => {
    expect(toQuote(quoteFixture)).toEqual({
      quote: quoteFixture.quote,
      character: 'Walter White',
    });
  });

  it('maps a character from snake_case without a death', () => {
    const character = toCharacter(characterFixture);

    expect(character).toMatchObject({
      name: 'Walter White',
      birthday: '09-07-1958',
      portrayedBy: 'Bryan Cranston',
      status: 'Dead',
    });
    expect(character.images).toHaveLength(8);
    expect(character.aliases).toContain('Heisenberg');
    expect(character.death).toBeUndefined();
  });

  it('maps a death from snake_case', () => {
    expect(toDeath(deathFixture)).toEqual({
      character: 'Walter White',
      image: deathFixture.image,
      details: deathFixture.details,
      lastWords: 'Well, erm... goodbye, Lydia.',
    });
  });

  it('maps an episode from snake_case', () => {
    expect(toEpisode(episodeFixture)).toMatchObject({
      episode: 101,
      title: 'Pilot',
      writtenBy: 'Vince Gilligan',
      directedBy: 'Vince Gilligan',
      airDate: '01-20-2008',
    });
  });
});

describe('formatSeasonEpisode', () => {
  it.each([
    [101, 'Season 1 Episode 1'],
    [110, 'Season 1 Episode 10'],
    [507, 'Season 5 Episode 7'],
    [516, 'Season 5 Episode 16'],
  ])('%i → %s', (episode, expected) => {
    expect(formatSeasonEpisode(episode)).toBe(expected);
  });
});

describe('shows', () => {
  it('lists the productions in tab order with a key each', () => {
    expect(SHOWS).toEqual(['Breaking Bad', 'Better Call Saul', 'El Camino']);
    expect(SHOWS.map((show) => SHOW_KEYS[show])).toEqual([
      'breakingBad',
      'betterCallSaul',
      'elCamino',
    ]);
  });
});
