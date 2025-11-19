# Example: Basic Repository Analysis

This example demonstrates basic repository analysis using Administrator.

## Code

```typescript
import { RepositoryAnalyzer } from 'administrator';

async function analyzeRepository() {
  // Initialize the analyzer
  const analyzer = new RepositoryAnalyzer({
    github: {
      token: process.env.GITHUB_TOKEN || '',
    },
  });

  try {
    // Analyze a repository
    console.log('Analyzing repository...');
    const result = await analyzer.analyze('facebook/react');

    // Display results
    console.log('\n=== Analysis Results ===\n');
    console.log(`Repository: ${result.repository.owner}/${result.repository.name}`);
    console.log(`Overall Score: ${result.score.overall}/100`);
    console.log(`Grade: ${result.score.grade}`);
    console.log(`Language: ${result.repository.language}`);
    console.log(`Stars: ${result.repository.stars}`);
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);

    console.log('\n=== Score Breakdown ===\n');
    Object.entries(result.score.breakdown).forEach(([dimension, score]) => {
      console.log(`${dimension}: ${score}/100`);
    });

    console.log('\n=== Recommendations ===\n');
    result.score.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  } catch (error) {
    console.error('Analysis failed:', error);
    process.exit(1);
  }
}

// Run the analysis
analyzeRepository();
```

## Usage

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_token_here

# Run the script
npx ts-node example-basic.ts
```

## Expected Output

```
Analyzing repository...

=== Analysis Results ===

Repository: facebook/react
Overall Score: 92/100
Grade: A
Language: JavaScript
Stars: 215000
Duration: 8.34s

=== Score Breakdown ===

codeQuality: 88/100
documentation: 95/100
testing: 90/100
community: 94/100
security: 91/100
dependencies: 85/100

=== Recommendations ===

1. Great work! Continue maintaining high quality standards
```
