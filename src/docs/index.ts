import AdvancedUsage from './advanced-usage.md';
import Api from './api.md';
import BasicUsage from './basic-usage.md';
import CheatSheet from './cheat-sheet.md';
import Configuration from './configuration.md';
import Faq from './faq.md';
import GetHelp from './get-help.md';
import GetStarted from './get-started.md';
import Overview from './overview.md';
import RewriteProperties from './rewrite-properties.md';
import SyntaxReference from './syntax-reference.md';
import TipsAndTricks from './tips-and-tricks.md';
export const docs = {
  "advanced-usage": AdvancedUsage,
  "api": Api,
  "basic-usage": BasicUsage,
  "cheat-sheet": CheatSheet,
  "configuration": Configuration,
  "faq": Faq,
  "get-help": GetHelp,
  "get-started": GetStarted,
  "overview": Overview,
  "rewrite-properties": RewriteProperties,
  "syntax-reference": SyntaxReference,
  "tips-and-tricks": TipsAndTricks,
} as Record<string, unknown>;
