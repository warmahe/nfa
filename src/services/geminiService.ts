export interface TransformationPath {
  destinationId: string;
  reasoning: string;
  manifestoExcerpt: string;
  vibeScore: number;
}

const MOCK_RESPONSES: Record<string, TransformationPath> = {
  andes: {
    destinationId: "andes",
    reasoning: "Your hunger for altitude and raw wilderness aligns perfectly with the vertical world of the Andes.",
    manifestoExcerpt: "The mountain does not care about your comfort zone. It only cares whether you showed up. You did. Now climb.",
    vibeScore: 91,
  },
  namib: {
    destinationId: "namib",
    reasoning: "Your craving for silence and ancient landscapes points directly to the oldest desert on Earth.",
    manifestoExcerpt: "The Namib does not whisper — it roars in silence. Here, the red dunes are your only compass and the stars your only ceiling.",
    vibeScore: 87,
  },
  balkans: {
    destinationId: "balkans",
    reasoning: "Your need for layered history and raw human connection finds its match in the scarred, beautiful Balkans.",
    manifestoExcerpt: "The Balkans are not a postcard. They are a scar map of a continent that refused to forget. Walk these roads and you walk through time itself.",
    vibeScore: 83,
  },
  mongolia: {
    destinationId: "mongolia",
    reasoning: "Your desire for boundless open space and total freedom is answered by the infinite steppe of Mongolia.",
    manifestoExcerpt: "There are no walls here. No signs, no borders, no ceilings. Just you, a horizon that never ends, and the wind that has been blowing since before civilization began.",
    vibeScore: 95,
  },
};

function pickDestination(vibe: string): string {
  const v = vibe.toLowerCase();
  if (v.match(/mountain|altitude|peak|climb|high|cold|snow|andes/)) return "andes";
  if (v.match(/desert|silence|sand|dry|ancient|africa|namib/)) return "namib";
  if (v.match(/history|culture|city|urban|people|europe|balkan/)) return "balkans";
  if (v.match(/open|steppe|freedom|vast|empty|mongol|endless/)) return "mongolia";
  // Default: pick pseudo-randomly based on string length
  const ids = ["andes", "namib", "balkans", "mongolia"];
  return ids[vibe.length % ids.length];
}

export async function getTransformationPath(userVibe: string): Promise<TransformationPath> {
  // Simulate a short network delay for realism
  await new Promise((resolve) => setTimeout(resolve, 800));
  const id = pickDestination(userVibe);
  return MOCK_RESPONSES[id];
}
