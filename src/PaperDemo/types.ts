export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg_dark: string;
  bg_mid: string;
  tag_color: string;
}

export interface PaperMeta {
  title: string;
  authors: string[];
  venue: string;
  year: number;
  paper_type: string;
  domain_tags: string[];
}

export interface Bullet {
  icon: string;
  title: string;
  desc: string;
}

export interface KeyPoint {
  icon: string;
  text: string;
}

export interface ContributionItem {
  num: string;
  title: string;
  desc: string;
}

export interface Stat {
  value: string;
  label: string;
}

export type Scene =
  | { type: "title"; duration_seconds: number }
  | {
      type: "problem";
      title: string;
      bullets: Bullet[];
      duration_seconds: number;
    }
  | {
      type: "method";
      title: string;
      pipeline_steps: string[];
      key_points: KeyPoint[];
      figure: string | null;
      figure_caption: string | null;
      duration_seconds: number;
    }
  | {
      type: "contributions";
      title: string;
      items: ContributionItem[];
      duration_seconds: number;
    }
  | {
      type: "results";
      title: string;
      stats: Stat[];
      figure: string | null;
      figure_caption: string | null;
      duration_seconds: number;
    };

export interface PaperData {
  meta: PaperMeta;
  theme: Theme;
  scenes: Scene[];
}

export interface PaperDemoProps {
  dataUrl: string; // URL to paper-data.json (via staticFile)
  paperData: PaperData | null; // populated by calculateMetadata
}
