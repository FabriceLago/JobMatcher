import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Plus,
  Check,
  TrendingUp,
  Target,
  Building,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Lightbulb,
  Zap
} from 'lucide-react';
import { JobOffer, UserProfile } from '../types';

export interface SuggestedKeyword {
  keyword: string;
  category: 'methodology' | 'tool' | 'domain' | 'certification' | 'soft_skill';
  impactScore: string;
  frequency: number;
  reason: string;
  relevantCompanies?: string[];
}

interface AIKeywordSuggesterProps {
  userProfile: UserProfile;
  jobs: JobOffer[];
  onAddSkillToProfile: (skillName: string, category: string, reason?: string) => void;
  onCopyNotice?: (text: string) => void;
}

export const AIKeywordSuggester: React.FC<AIKeywordSuggesterProps> = ({
  userProfile,
  jobs,
  onAddSkillToProfile,
  onCopyNotice
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keywords, setKeywords] = useState<SuggestedKeyword[]>(() => {
    // Initial intelligent curated keywords for Lausanne & Vaud
    return [
      {
        keyword: 'SAFe (Scaled Agile Framework)',
        category: 'methodology',
        impactScore: '+18%',
        frequency: 4,
        reason: 'Très demandé par les grandes structures vaudoises (BCV, CHUV) pour le cadrage agile multi-équipes.',
        relevantCompanies: ['BCV', 'CHUV', 'Vaudoise Assurances']
      },
      {
        keyword: 'Atlassian Jira & Confluence',
        category: 'tool',
        impactScore: '+15%',
        frequency: 5,
        reason: 'Standard incontournable pour le pilotage de backlogs et la documentation collaborative en Suisse romande.',
        relevantCompanies: ['Logitech', 'EPFL', 'Retraites Populaires']
      },
      {
        keyword: 'Gouvernance nLPD / RGPD',
        category: 'domain',
        impactScore: '+12%',
        frequency: 3,
        reason: 'Exigence clé depuis la nouvelle loi fédérale sur la protection des données pour tout projet IT vaudois.',
        relevantCompanies: ['Vaudoise Assurances', 'CHUV']
      },
      {
        keyword: 'Power BI & Reporting Exécutif',
        category: 'tool',
        impactScore: '+14%',
        frequency: 3,
        reason: 'Très valorisé par les directions générales pour la restitution de dashboards KPI et le suivi budgétaire en CHF.',
        relevantCompanies: ['Nestlé', 'BCV']
      }
    ];
  });
  const [marketInsight, setMarketInsight] = useState<string>(
    'Sur Lausanne, les employeurs valorisent particulièrement la double compétence : rigueur méthodologique (Agile/SAFe) et conformité réglementaire suisse.'
  );
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set());

  // Trigger AI Gap Analysis
  const handleAnalyzeKeywords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/suggest-missing-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          jobs: jobs.filter(j => !j.isEliminated).slice(0, 15)
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setKeywords(data.suggestedKeywords || []);
        if (data.marketInsight) {
          setMarketInsight(data.marketInsight);
        }
        if (onCopyNotice) {
          onCopyNotice('Analyse IA terminée : nouveaux mots-clés stratégiques détectés !');
        }
      }
    } catch (err) {
      console.error('Error suggesting keywords:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeyword = (kw: SuggestedKeyword) => {
    onAddSkillToProfile(kw.keyword, kw.category, kw.reason);
    setAddedKeywords(prev => new Set(prev).add(kw.keyword));
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/40 rounded-2xl border border-red-900/50 shadow-md overflow-hidden text-white transition-all">
      {/* Header bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Analyseur IA de Mots-Clés Manquants (Skill Gap)
              </h3>
              <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 font-semibold px-2 py-0.5 rounded-full hidden sm:inline">
                Marché Vaudois
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Détecte les compétences et termes ATS exigés dans vos offres analysées mais absents de votre profil.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAnalyzeKeywords}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Lancer l'analyse sémantique Gemini sur votre profil"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Analyser avec l'IA</span>
            <span className="sm:hidden">IA</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
            title={isExpanded ? 'Réduire' : 'Déplier'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Market insight banner */}
          {marketInsight && (
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start gap-2.5 text-slate-300">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-white text-[11px] block">Tendance RH à Lausanne & Vaud :</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">{marketInsight}</p>
              </div>
            </div>
          )}

          {/* Keywords Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keywords.map((kw, idx) => {
              const isAdded = addedKeywords.has(kw.keyword);

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 flex flex-col justify-between space-y-2.5 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>{kw.keyword}</span>
                      </div>
                      <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0">
                        {kw.impactScore} match
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {kw.reason}
                    </p>

                    {kw.relevantCompanies && kw.relevantCompanies.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Demandé chez : <strong className="text-slate-300">{kw.relevantCompanies.join(', ')}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {kw.category === 'methodology' ? 'Méthodologie' : kw.category === 'tool' ? 'Outil / SI' : 'Domaine'}
                    </span>

                    <button
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddKeyword(kw)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-default'
                          : 'bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/80'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Ajouté au profil</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 text-red-400" />
                          <span>+ Ajouter au profil</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>
              💡 <em>L'ajout d'un mot-clé recalcule automatiquement les scores de matching des offres correspondantes.</em>
            </span>
            <span className="text-slate-500">
              {keywords.length} suggestion(s) IA
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
