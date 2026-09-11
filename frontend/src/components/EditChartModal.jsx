import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, RotateCcw, Check, Sparkles } from 'lucide-react';
import GoogleSheets3DPieChart from './GoogleSheets3DPieChart.jsx';

export default function EditChartModal({
  isOpen,
  onClose,
  data = [],
  onUpdateData,
  chartConfig,
  onUpdateConfig
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('customize'); // 'setup' | 'customize'
  const [selectedCompanyId, setSelectedCompanyId] = useState(data[0]?.id || null);

  // Accordion Expand/Collapse States matching Images 2, 3, 4, 5
  const [openAccordions, setOpenAccordions] = useState({
    chartStyle: true,
    pieChart: false,
    pieSlice: false,
    titles: false
  });

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCompany = data.find(c => c.id === selectedCompanyId) || data[0];

  const handleCompanyColorChange = (color) => {
    if (!selectedCompany) return;
    const updated = data.map(item => item.id === selectedCompany.id ? { ...item, color } : item);
    onUpdateData(updated);
  };

  const handleResetLayout = () => {
    onUpdateConfig({
      bgColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      is3D: true,
      donutHole: 0,
      labelType: 'percentage',
      sliceBorderColor: '#ffffff',
      titleText: 'EE Placement Statistics 2026',
      titleColor: '#0f172a',
      titleFontSize: 20,
      titleBold: true,
      titleItalic: false,
      titleAlign: 'center',
      selectedSliceId: null,
      explodeDistance: 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-black text-slate-900">Chart editor</h2>
          </div>

          {/* Setup / Customize Tab Switcher matching Image 1 */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 text-xs font-extrabold bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('setup')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                activeTab === 'setup'
                  ? 'bg-slate-100 text-emerald-700 font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Setup
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('customize')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                activeTab === 'customize'
                  ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-black shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Customize
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Split (Live Chart Left | Google Sheets Controls Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-grow divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* Left Column (7 cols): Live Interactive 3D Pie Chart Preview */}
          <div
            className="lg:col-span-7 p-6 flex flex-col items-center justify-center min-h-[420px] transition-colors"
            style={{ backgroundColor: chartConfig.bgColor || '#ffffff' }}
          >
            <GoogleSheets3DPieChart
              data={data}
              title={chartConfig.titleText}
              bgColor={chartConfig.bgColor}
              is3D={chartConfig.is3D}
              donutHole={chartConfig.donutHole}
              fontFamily={chartConfig.fontFamily}
              titleColor={chartConfig.titleColor}
              titleFontSize={chartConfig.titleFontSize}
              titleBold={chartConfig.titleBold}
              titleItalic={chartConfig.titleItalic}
              titleAlign={chartConfig.titleAlign}
              labelType={chartConfig.labelType}
              sliceBorderColor={chartConfig.sliceBorderColor}
              selectedSliceId={chartConfig.selectedSliceId}
              explodeDistance={chartConfig.explodeDistance}
            />
          </div>

          {/* Right Column (5 cols): Google Sheets Customization Panel (Images 2, 3, 4, 5) */}
          <div className="lg:col-span-5 p-5 bg-white space-y-3 overflow-y-auto text-xs">
            
            {/* 1. Chart style Accordion matching Image 2 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => toggleAccordion('chartStyle')}
                className="w-full p-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 font-extrabold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  {openAccordions.chartStyle ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  <span>Chart style</span>
                </span>
              </button>

              {openAccordions.chartStyle && (
                <div className="p-4 space-y-4 bg-white border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Background color</label>
                      <input
                        type="color"
                        value={chartConfig.bgColor || '#ffffff'}
                        onChange={(e) => onUpdateConfig({ ...chartConfig, bgColor: e.target.value })}
                        className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Font</label>
                      <select
                        value={chartConfig.fontFamily || 'Inter, sans-serif'}
                        onChange={(e) => onUpdateConfig({ ...chartConfig, fontFamily: e.target.value })}
                        className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                      >
                        <option value="Inter, sans-serif">Theme Default (Inter)</option>
                        <option value="Roboto, sans-serif">Roboto</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Montserrat, sans-serif">Montserrat</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Chart border color</label>
                    <input
                      type="color"
                      value={chartConfig.sliceBorderColor === 'none' ? '#ffffff' : chartConfig.sliceBorderColor}
                      onChange={(e) => onUpdateConfig({ ...chartConfig, sliceBorderColor: e.target.value })}
                      className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleResetLayout}
                      className="px-3 py-1 rounded-lg border border-emerald-600 text-emerald-700 font-extrabold text-xs hover:bg-emerald-50"
                    >
                      Reset layout
                    </button>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={chartConfig.is3D}
                        onChange={(e) => onUpdateConfig({ ...chartConfig, is3D: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>3D</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Pie chart Accordion matching Image 3 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => toggleAccordion('pieChart')}
                className="w-full p-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 font-extrabold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  {openAccordions.pieChart ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  <span>Pie chart</span>
                </span>
              </button>

              {openAccordions.pieChart && (
                <div className="p-4 space-y-4 bg-white border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Donut hole</label>
                      <select
                        value={chartConfig.donutHole}
                        onChange={(e) => onUpdateConfig({ ...chartConfig, donutHole: Number(e.target.value) })}
                        className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                      >
                        <option value={0}>0%</option>
                        <option value={25}>25%</option>
                        <option value={40}>40%</option>
                        <option value={50}>50%</option>
                        <option value={75}>75%</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Slice label</label>
                      <select
                        value={chartConfig.labelType}
                        onChange={(e) => onUpdateConfig({ ...chartConfig, labelType: e.target.value })}
                        className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                      >
                        <option value="percentage">Percentage (15.9%)</option>
                        <option value="name">Company Name</option>
                        <option value="value">Offer Count</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Pie slice Accordion matching Image 4 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => toggleAccordion('pieSlice')}
                className="w-full p-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 font-extrabold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  {openAccordions.pieSlice ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  <span>Pie slice</span>
                </span>
              </button>

              {openAccordions.pieSlice && (
                <div className="p-4 space-y-4 bg-white border-t border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Select Company</label>
                    <select
                      value={selectedCompanyId || ''}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setSelectedCompanyId(id);
                        onUpdateConfig({ ...chartConfig, selectedSliceId: id });
                      }}
                      className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700"
                    >
                      {data.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedCompany && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 block">Slice Color</label>
                        <input
                          type="color"
                          value={selectedCompany.color || '#3b82f6'}
                          onChange={(e) => handleCompanyColorChange(e.target.value)}
                          className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 block">Distance from center</label>
                        <select
                          value={chartConfig.explodeDistance}
                          onChange={(e) => onUpdateConfig({ ...chartConfig, selectedSliceId: selectedCompany.id, explodeDistance: Number(e.target.value) })}
                          className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                        >
                          <option value={0}>0%</option>
                          <option value={10}>10%</option>
                          <option value={25}>25%</option>
                          <option value={50}>50%</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Chart & axis titles Accordion matching Image 5 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => toggleAccordion('titles')}
                className="w-full p-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 font-extrabold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  {openAccordions.titles ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  <span>Chart & axis titles</span>
                </span>
              </button>

              {openAccordions.titles && (
                <div className="p-4 space-y-4 bg-white border-t border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Title text</label>
                    <input
                      type="text"
                      value={chartConfig.titleText}
                      onChange={(e) => onUpdateConfig({ ...chartConfig, titleText: e.target.value })}
                      className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Title Color</label>
                      <input
                        type="color"
                        value={chartConfig.titleColor}
                        onChange={(e) => onUpdateConfig({ ...chartConfig, titleColor: e.target.value })}
                        className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Size (px)</label>
                      <input
                        type="number"
                        value={chartConfig.titleFontSize}
                        onChange={(e) => onUpdateConfig({ ...chartConfig, titleFontSize: Number(e.target.value) })}
                        className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <label className="text-[11px] font-bold text-slate-600 block mr-2">Format:</label>
                    <button
                      type="button"
                      onClick={() => onUpdateConfig({ ...chartConfig, titleBold: !chartConfig.titleBold })}
                      className={`px-3 py-1 rounded font-black border ${chartConfig.titleBold ? 'bg-emerald-100 border-emerald-500 text-emerald-900' : 'bg-slate-50 border-slate-300'}`}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateConfig({ ...chartConfig, titleItalic: !chartConfig.titleItalic })}
                      className={`px-3 py-1 rounded font-black italic border ${chartConfig.titleItalic ? 'bg-emerald-100 border-emerald-500 text-emerald-900' : 'bg-slate-50 border-slate-300'}`}
                    >
                      I
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Done Customizing</span>
          </button>
        </div>

      </div>
    </div>
  );
}
