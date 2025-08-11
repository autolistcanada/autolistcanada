// ai/index.js - AutoList Canada Extension
// Main AI helper entry point

import { TitleGenerator } from './title-generator.js';
import { DescriptionBuilder } from './description-builder.js';
import { TagAssistant } from './tag-assistant.js';
import { PriceOptimizer } from './price-optimizer.js';

// Initialize AI helpers
const titleGenerator = new TitleGenerator();
const descriptionBuilder = new DescriptionBuilder();
const tagAssistant = new TagAssistant();
const priceOptimizer = new PriceOptimizer();

// Export for use in other modules
export { titleGenerator, descriptionBuilder, tagAssistant, priceOptimizer };
