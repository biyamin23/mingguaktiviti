'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  AlertTriangle, 
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { processMasterData } from '@/lib/validation/master-data';
import { createTeacher, createHomeroom } from '@/lib/supabase/service';
import { FormLevel } from '@/types/database';

const SAMPLE_CSV = `Tingkatan,Nama Homeroom,Nama Penasihat,Nombor Gaji
1,1 Al-Farabi,Ustazah Siti Aminah binti Razak,G1002
1,1 Ibn Sina,Cikgu Mohd Danial bin Hashim,G1003
1,1 Al-Biruni,Cikgu Wan Azura binti Wan Daud,G1014
2,2 Al-Farabi,Cikgu Nurul Huda binti Othman,G1004
2,2 Ibn Sina,Cikgu Khairul Anuar bin Salleh,G1005
3,3 Al-Farabi,Cikgu Wan Noraini binti Wan Ismail,G1006
3,3 Ibn Sina,Cikgu Muhammad Faiz bin Azman,G1007
4,4 Al-Farabi,Cikgu Nor Asyikin binti Mat Zin,G1008
4,4 Ibn Sina,Cikgu Hafiz bin Abdullah,G1009
5,5 Al-Farabi,Cikgu Rozita binti Ramli,G1010`;

export default function MasterDataImportPage() {
  const toast = useToast();
  const [inputText, setInputText] = useState(SAMPLE_CSV);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const handleParseAndValidate = () => {
    setIsProcessing(true);
    try {
      const lines = inputText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length <= 1) {
        toast.error('Data CSV tidak mencukupi.');
        setIsProcessing(false);
        return;
      }

      // Check header
      const rows = lines.slice(1).map(l => {
        const parts = l.split(',').map(p => p.trim());
        return {
          form: parseInt(parts[0], 10),
          homeroom_name: parts[1] || '',
          teacher_name: parts[2] || '',
          salary_no: parts[3] || '',
        };
      });

      const res = processMasterData(rows);
      setSummary({ ...res, parsedRows: rows });
      toast.info(`Semakan selesai. ${res.needsReview} isu dikesan.`);
    } catch (e: any) {
      toast.error('Ralat membaca data: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!summary || !summary.parsedRows) return;
    setIsImporting(true);

    try {
      let createdT = 0;
      let createdH = 0;

      for (const row of summary.parsedRows) {
        // Only import rows that have clean salary and valid homeroom
        if (row.salary_no && row.homeroom_name && row.form >= 1 && row.form <= 5) {
          // 1. Create teacher if not exist
          const tRes = await createTeacher({
            salary_no: row.salary_no.toUpperCase(),
            name: row.teacher_name,
            role: `Penasihat Homeroom T${row.form}`,
          });

          const teacherId = tRes.data?.id;

          // 2. Create homeroom
          await createHomeroom({
            form: row.form as FormLevel,
            name: row.homeroom_name,
            advisor_teacher_id: teacherId || null,
          });

          createdT++;
          createdH++;
        }
      }

      toast.success(`Import berjaya! ${createdT} guru & ${createdH} homeroom disimpan.`);
    } catch (e: any) {
      toast.error('Ralat semasa import: ' + e.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EFF6FF] text-[#1646A0]">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#172033] tracking-tight">
              Import & Semakan Data Master Homeroom
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Mekanisme pengimportan selamat bagi senarai Tingkatan, Homeroom, Penasihat, dan Nombor Gaji.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Editor Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Masukkan Data CSV</CardTitle>
            <p className="text-xs text-[#64748B]">
              Format wajib: <code>Tingkatan,Nama Homeroom,Nama Penasihat,Nombor Gaji</code>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              rows={12}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] leading-relaxed"
            />

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputText(SAMPLE_CSV)}
              >
                Muat Contoh MRSM
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleParseAndValidate}
                isLoading={isProcessing}
              >
                Semak & Sahkan Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Validation Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Laporan Semakan Integriti (Summary)</CardTitle>
            <p className="text-xs text-[#64748B]">
              Hasil analisis automatik dan pengesanan rekod bertindih.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!summary ? (
              <div className="p-12 text-center text-xs text-[#94A3B8] border border-dashed rounded-xl">
                Sila klik butang "Semak & Sahkan Data" untuk melihat analisis integriti.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Metric chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
                    <span className="text-[10px] text-[#15803D] font-bold block">GURU SAH</span>
                    <strong className="text-lg font-black text-[#15803D]">{summary.createdTeachers}</strong>
                  </div>
                  <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl">
                    <span className="text-[10px] text-[#1646A0] font-bold block">HOMEROOM</span>
                    <strong className="text-lg font-black text-[#1646A0]">{summary.createdHomerooms}</strong>
                  </div>
                  <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
                    <span className="text-[10px] text-[#B91C1C] font-bold block">PERLU SEMAKAN</span>
                    <strong className="text-lg font-black text-[#B91C1C]">{summary.needsReview}</strong>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <span className="text-[10px] text-[#64748B] font-bold block">DILANGKAU</span>
                    <strong className="text-lg font-black text-[#64748B]">{summary.skipped}</strong>
                  </div>
                </div>

                {/* Anomaly list */}
                {summary.issues.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#B91C1C] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Rekod Perlu Semakan Data ({summary.issues.length}):</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-[#FEF2F2]/40 rounded-xl border border-[#FECACA]">
                      {summary.issues.map((iss: any, i: number) => (
                        <div key={i} className="text-[11px] p-2 bg-white rounded-lg border border-[#FECACA] text-[#7F1D1D]">
                          <strong>Baris {iss.row}:</strong> {iss.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[#F1F5F9] flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleExecuteImport}
                    isLoading={isImporting}
                    className="w-full sm:w-auto"
                  >
                    <Database className="w-4 h-4 mr-1.5" />
                    <span>Import Ke Pangkalan Data Supabase</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
