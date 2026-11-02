import React, { useState } from 'react';
import { HelpCircle, ChevronDown, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VivaAccordion({ title, question, answer, formula, keyPoints = [], defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl overflow-hidden transition-all duration-200 hover:border-indigo-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
      >
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-700 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Viva Insight</span>
            <h4 className="text-sm font-semibold text-slate-800">{title || question}</h4>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-indigo-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-indigo-100/60 text-xs sm:text-sm text-slate-700 space-y-3">
          {question && (
            <p className="font-medium text-slate-900 bg-white/70 p-2.5 rounded-lg border border-indigo-50">
              <span className="text-indigo-600 font-bold mr-1.5">Q:</span>
              {question}
            </p>
          )}

          <p className="leading-relaxed text-slate-600">{answer}</p>

          {formula && (
            <div className="p-3 bg-slate-900 text-indigo-200 rounded-lg font-mono text-xs overflow-x-auto shadow-inner">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Mathematical Formulation:</span>
              <code>{formula}</code>
            </div>
          )}

          {keyPoints.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Key Evaluation Takeaways:</span>
              {keyPoints.map((pt, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
