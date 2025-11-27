#!/usr/bin/env node

/**
 * CLI entry point for Administrator
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { RepositoryAnalyzer } from './analyzers/RepositoryAnalyzer';
import { ReportGenerator } from './reporters/ReportGenerator';
import { promises as fs } from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('administrator')
  .description('AI-powered CLI tool to analyze & classify GitHub repositories automatically')
  .version('1.0.0');

program
  .command('analyze <repository>')
  .description('Analyze a GitHub repository')
  .option('-f, --format <format>', 'Output format (markdown, json)', 'markdown')
  .option('-o, --output <directory>', 'Output directory', './reports')
  .option('-v, --verbose', 'Verbose output', false)
  .action(
    async (repository: string, options: { format: string; output: string; verbose: boolean }) => {
      const spinner = ora('Analyzing repository...').start();

      try {
        const analyzer = new RepositoryAnalyzer();
        const result = await analyzer.analyze(repository);

        spinner.succeed(chalk.green('Analysis complete!'));

        // Display results
        console.log(chalk.bold('\n📊 Analysis Results\n'));
        console.log(chalk.cyan(`Repository: ${result.repository.owner}/${result.repository.name}`));
        console.log(
          chalk.cyan(`Overall Score: ${result.score.overall}/100 (Grade: ${result.score.grade})`)
        );
        console.log(chalk.cyan(`Duration: ${(result.duration / 1000).toFixed(2)}s`));

        console.log(chalk.bold('\n📈 Score Breakdown:\n'));
        Object.entries(result.score.breakdown).forEach(([key, value]) => {
          const numValue = value as number;
          const color = numValue >= 80 ? chalk.green : numValue >= 60 ? chalk.yellow : chalk.red;
          console.log(`  ${key}: ${color(numValue.toString())}/100`);
        });

        // Generate report
        const reportGen = new ReportGenerator();
        await fs.mkdir(options.output, { recursive: true });

        const repoName = `${result.repository.owner}_${result.repository.name}`;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        if (options.format === 'markdown' || options.format === 'both') {
          const markdown = reportGen.generateMarkdown(result);
          const mdPath = path.join(options.output, `${repoName}_${timestamp}.md`);
          await fs.writeFile(mdPath, markdown);
          console.log(chalk.green(`\n✅ Markdown report saved to: ${mdPath}`));
        }

        if (options.format === 'json' || options.format === 'both') {
          const json = reportGen.generateJson(result);
          const jsonPath = path.join(options.output, `${repoName}_${timestamp}.json`);
          await fs.writeFile(jsonPath, json);
          console.log(chalk.green(`✅ JSON report saved to: ${jsonPath}`));
        }

        if (options.verbose) {
          console.log('\n' + reportGen.generateMarkdown(result));
        }
      } catch (error) {
        spinner.fail(chalk.red('Analysis failed'));
        console.error(chalk.red('\nError:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    }
  );

program
  .command('batch')
  .description('Analyze multiple repositories')
  .option('-f, --file <path>', 'File containing repository URLs (one per line)')
  .option('-r, --repos <repos...>', 'Space-separated list of repositories')
  .option('-o, --output <directory>', 'Output directory', './reports')
  .action(async (options: { file?: string; repos?: string[]; output: string }) => {
    const spinner = ora('Preparing batch analysis...').start();

    try {
      let repositories: string[] = [];

      if (options.file) {
        const content = await fs.readFile(options.file, 'utf-8');
        repositories = content.split('\n').filter((line: string) => line.trim());
      } else if (options.repos) {
        repositories = options.repos;
      } else {
        spinner.fail(chalk.red('Please provide repositories via --file or --repos'));
        process.exit(1);
      }

      spinner.text = `Analyzing ${repositories.length} repositories...`;

      const analyzer = new RepositoryAnalyzer();
      const batchResult = await analyzer.batchAnalyze(repositories);

      spinner.succeed(chalk.green('Batch analysis complete!'));

      console.log(chalk.bold('\n📊 Batch Analysis Results\n'));
      console.log(chalk.cyan(`Total: ${batchResult.total}`));
      console.log(chalk.green(`Completed: ${batchResult.completed}`));
      console.log(chalk.red(`Failed: ${batchResult.failed}`));

      if (batchResult.errors.length > 0) {
        console.log(chalk.bold('\n❌ Errors:\n'));
        batchResult.errors.forEach((err: { repository: string; error: string }) => {
          console.log(chalk.red(`  ${err.repository}: ${err.error}`));
        });
      }

      // Save batch report
      await fs.mkdir(options.output, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(options.output, `batch_analysis_${timestamp}.json`);
      await fs.writeFile(reportPath, JSON.stringify(batchResult, null, 2));

      console.log(chalk.green(`\n✅ Batch report saved to: ${reportPath}`));
    } catch (error) {
      spinner.fail(chalk.red('Batch analysis failed'));
      console.error(chalk.red('\nError:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show or validate configuration')
  .option('-s, --show', 'Show current configuration')
  .option('-v, --validate', 'Validate configuration')
  .action(async (options: { show?: boolean; validate?: boolean }) => {
    if (options.show) {
      console.log(chalk.bold('📋 Current Configuration\n'));
      console.log(
        'GitHub Token:',
        process.env.GITHUB_TOKEN ? chalk.green('✅ Set') : chalk.red('❌ Not set')
      );
      console.log(
        'OpenAI API Key:',
        process.env.OPENAI_API_KEY ? chalk.green('✅ Set') : chalk.red('❌ Not set')
      );
    }

    if (options.validate) {
      const spinner = ora('Validating configuration...').start();
      try {
        new RepositoryAnalyzer();
        spinner.succeed(chalk.green('Configuration is valid'));
      } catch (error) {
        spinner.fail(chalk.red('Configuration validation failed'));
        console.error(chalk.red('\nError:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    }

    if (!options.show && !options.validate) {
      console.log(chalk.yellow('Use --show or --validate'));
    }
  });

program.parse();
