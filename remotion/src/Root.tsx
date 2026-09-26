import React from 'react';
import { Composition } from 'remotion';
import './fonts';
import BodyJourney from './shots/body/BodyJourney';
import WhatIf from './shots/body/WhatIf';

// Lengths come from the props at render time (scripts/render.mjs overrides them).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BodyJourney" component={BodyJourney} durationInFrames={900} fps={30}
      width={1080} height={1920} defaultProps={{}} />
    <Composition id="WhatIf" component={WhatIf} durationInFrames={900} fps={30}
      width={1080} height={1920} defaultProps={{}} />
  </>
);
