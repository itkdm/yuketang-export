(function () {
  'use strict';

  // ===========================
  // 配置和常量
  // ===========================
  const HOST_EXAM = 'https://examination.xuetangx.com';
  const HOST_YKT = 'https://www.yuketang.cn';

  // 当前模式：'iframe' (小窗试卷) 或 'normal' (无图试卷)
  let currentMode = 'normal';

  // ===========================
  // 工具函数
  // ===========================
  function nowString() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  function uniq(arr) {
    const seen = new Set();
    const out = [];
    for (const x of arr || []) {
      if (!x) continue;
      if (seen.has(x)) continue;
      seen.add(x);
      out.push(x);
    }
    return out;
  }

  function htmlToText(html) {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '')
      .replace(/\u00A0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function htmlToTextSimple(html) {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
  }

  function base64ToUtf8(b64) {
    if (!b64) return '';
    let s = b64.trim();
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4 !== 0) s += '=';
    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }

  function downloadText(filename, text, mime = 'text/plain;charset=utf-8') {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  // Chrome Storage API 封装
  async function storageGet(key, defaultValue = '') {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    });
  }

  async function storageSet(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  // ===========================
  // Toast 提示
  // ===========================
  function toast(msg, ms = 2500) {
    let el = document.getElementById('__yuketang_export_toast__');
    if (!el) {
      el = document.createElement('div');
      el.id = '__yuketang_export_toast__';
      el.style.cssText =
        'position:fixed;right:16px;bottom:16px;z-index:999999;' +
        'background:rgba(0,0,0,.8);color:#fff;padding:10px 12px;' +
        'border-radius:10px;max-width:360px;font-size:13px;line-height:1.4;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => (el.style.display = 'none'), ms);
  }

  // ===========================
  // UI 组件（蓝色科技感风格）
  // ===========================
  function makeBtn(text, onClick) {
    const b = document.createElement('button');
    b.textContent = text;
    b.style.cssText =
      'display:block;width:100%;margin:8px 0;padding:10px 16px;border:0;' +
      'border-radius:8px;cursor:pointer;background:linear-gradient(135deg, #1677ff 0%, #4096ff 100%);color:#fff;font-size:14px;' +
      'font-weight:500;transition:all 0.2s;box-shadow:0 2px 8px rgba(22,119,255,0.3);';
    b.addEventListener('mouseenter', () => {
      b.style.background = 'linear-gradient(135deg, #4096ff 0%, #69b7ff 100%)';
      b.style.boxShadow = '0 4px 16px rgba(22,119,255,0.4)';
      b.style.transform = 'translateY(-1px)';
    });
    b.addEventListener('mouseleave', () => {
      b.style.background = 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)';
      b.style.boxShadow = '0 2px 8px rgba(22,119,255,0.3)';
      b.style.transform = 'translateY(0)';
    });
    b.addEventListener('click', onClick);
    return b;
  }

  function makePanel() {
    let panel = document.getElementById('__yuketang_export_panel__');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = '__yuketang_export_panel__';
    panel.style.cssText =
      'position:fixed;right:16px;top:50%;transform:translateY(-50%);z-index:999999;' +
      'background:linear-gradient(135deg, #e6f2ff 0%, #e8f4f8 100%);border:1.5px solid #91caff;box-shadow:0 8px 32px rgba(22,119,255,0.2), inset 0 1px 0 rgba(255,255,255,0.6);' +
      'border-radius:16px;padding:20px;width:220px;font-size:13px;backdrop-filter:blur(10px);';
    
    const modeText = currentMode === 'iframe' ? '小窗试卷模式' : '无图试卷模式';
    const descText = currentMode === 'iframe' ? '导出当前试卷内容' : '导出当前测验内容';
    const tipText = currentMode === 'iframe' ? '适用小窗试卷' : '适用无图试卷';
    
    panel.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
        <span style="display:inline-block;width:4px;height:16px;background:linear-gradient(180deg, #1677ff 0%, #69b7ff 100%);border-radius:2px;box-shadow:0 0 8px rgba(22,119,255,0.5);"></span>
        <div style="font-weight:700;font-size:16px;color:#0958d9;text-shadow:0 1px 2px rgba(255,255,255,0.8);">布吉岛的小工具</div>
      </div>
      <div style="margin-bottom:8px;">
        <select id="__mode_selector__" style="width:100%;padding:6px 8px;border:1px solid #91caff;border-radius:6px;background:#fff;color:#0958d9;font-size:12px;cursor:pointer;">
          <option value="normal">无图试卷模式</option>
          <option value="iframe">小窗试卷模式</option>
        </select>
      </div>
      <div style="color:#4a90e2;font-size:12px;margin-bottom:16px;line-height:1.5;">${descText}</div>
      <div id="__yuketang_export_actions__"></div>
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(145,202,255,0.5);color:#6ba3d8;font-size:11px;text-align:center;">${tipText}</div>
    `;
    
    document.body.appendChild(panel);
    
    // 模式切换
    const selector = panel.querySelector('#__mode_selector__');
    selector.value = currentMode;
    selector.addEventListener('change', (e) => {
      currentMode = e.target.value;
      initPanel();
    });
    
    return panel;
  }

  function initPanel() {
    const panel = makePanel();
    const actions = document.getElementById('__yuketang_export_actions__');
    if (!actions) return;
    
    actions.innerHTML = '';
    
    if (currentMode === 'iframe') {
      // 小窗试卷模式
      actions.appendChild(makeBtn('一键导出JSON', () => runExportIframe('json')));
      actions.appendChild(makeBtn('一键导出MD', () => runExportIframe('md')));
    } else {
      // 无图试卷模式
      actions.appendChild(makeBtn('一键导出MD', () => runExportNormal('md')));
      actions.appendChild(makeBtn('一键导出JSON', () => runExportNormal('json')));
    }
    
    // 更新说明文字
    const descEl = panel.querySelector('div[style*="color:#4a90e2"]');
    const tipEl = panel.querySelector('div[style*="color:#6ba3d8"]');
    if (descEl) {
      descEl.textContent = currentMode === 'iframe' ? '导出当前试卷内容' : '导出当前测验内容';
    }
    if (tipEl) {
      tipEl.textContent = currentMode === 'iframe' ? '适用小窗试卷' : '适用无图试卷';
    }
  }

  // ===========================
  // 模式1：小窗试卷（iframe）
  // ===========================
  function detectQuizId() {
    const url = location.href;
    let m = url.match(/studentQuiz\/(\d+)/i);
    if (m) return m[1];
    m = url.match(/quiz_info\/(\d+)/i);
    if (m) return m[1];
    m = url.match(/[?&]quiz_id=(\d+)/i);
    if (m) return m[1];
    m = url.match(/\/(\d{6,})/);
    if (m) return m[1];
    return null;
  }

  async function fetchQuizInfoHtml(quizId) {
    const url = `https://www.yuketang.cn/v/quiz/quiz_info/${quizId}/?pageIndex=1`;
    const resp = await fetch(url, { credentials: 'include' });
    if (!resp.ok) throw new Error(`fetch quiz_info failed: ${resp.status}`);
    return await resp.text();
  }

  function parseQuizInfoHtml(html) {
    const getVar = (name) => {
      const re = new RegExp(String.raw`var\s+${name}\s*=\s*['"]([^'"]+)['"]\s*;`, 'i');
      const m = html.match(re);
      return m ? m[1] : null;
    };

    const quizID = getVar('quizID') || getVar('quizId') || null;
    const showAnswer = getVar('showAnswer');
    const quizAuth = getVar('quizAuth');
    const m = html.match(/var\s+quizData\s*=\s*['"]([^'"]+)['"]\s*;/i);
    const quizDataB64 = m ? m[1] : null;

    if (!quizDataB64) {
      throw new Error('未在 quiz_info HTML 中找到 var quizData = \'...\';');
    }

    const jsonText = base64ToUtf8(quizDataB64);
    const quizJson = safeJsonParse(jsonText);
    if (!quizJson) {
      throw new Error('quizData base64 decode 后不是合法 JSON');
    }

    return { quizID, showAnswer, quizAuth, quizJson, raw: { quizDataB64 } };
  }

  function extractRemarkText(problem) {
    const rr = problem?.RemarkRich;
    const shapes = rr?.Shapes || [];
    const texts = [];
    for (const s of shapes) {
      if (!s?.Paragraphs) continue;
      for (const p of s.Paragraphs) {
        const lines = p?.Lines || [];
        for (const ln of lines) {
          if (ln?.Html) texts.push(htmlToTextSimple(ln.Html));
        }
      }
    }
    return texts.join('\n').trim();
  }

  function collectUrlsFromSlide(slide) {
    const urls = [];
    for (const s of (slide?.Shapes || [])) {
      if (s?.URL) urls.push(s.URL);
    }
    const rrShapes = slide?.Problem?.RemarkRich?.Shapes || [];
    for (const s of rrShapes) {
      if (s?.URL) urls.push(s.URL);
    }
    return uniq(urls);
  }

  function collectStemAssetsFromSlide(slide) {
    const urls = [];
    for (const s of (slide?.Shapes || [])) {
      if (s?.URL) urls.push(s.URL);
    }
    return uniq(urls);
  }

  function mapChoicesByBullets(slide) {
    const bullets = slide?.Problem?.Bullets || [];
    const shapes = (slide?.Shapes || []).filter(s => s?.URL && typeof s.Top === 'number' && typeof s.Left === 'number');
    if (!bullets.length || !shapes.length) return { choices: {}, confidence: 'low' };

    const used = new Set();
    const choices = {};

    for (const b of bullets) {
      const label = b?.Label;
      if (!label) continue;

      let best = null;
      let bestScore = Infinity;

      for (const s of shapes) {
        if (used.has(s.ID)) continue;
        const leftOk = (typeof b.Left === 'number') ? (s.Left >= b.Left) : true;
        if (!leftOk) continue;

        const dt = Math.abs((s.Top ?? 0) - (b.Top ?? 0));
        const dl = Math.abs((s.Left ?? 0) - (b.Left ?? 0));
        const score = dt * 2 + dl * 0.2;
        if (score < bestScore) {
          bestScore = score;
          best = s;
        }
      }

      if (best) {
        used.add(best.ID);
        choices[label] = best.URL;
      }
    }

    const conf = Object.keys(choices).length >= 2 ? 'medium' : 'low';
    return { choices, confidence: conf };
  }

  function buildExportIframe(meta) {
    const quizJson = meta.quizJson;
    const slides = quizJson?.Slides || [];
    const problems = [];
    let qNo = 0;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const p = slide?.Problem;
      if (!p || !p.Type) continue;

      qNo += 1;
      const type = p.Type;
      const common = {
        no: qNo,
        slideIndex: i + 1,
        type,
        problemId: p.ProblemID ?? null,
        score: p.Score ?? p.DefaultScore ?? null,
        hasRemark: p.HasRemark ?? null,
        assets: collectUrlsFromSlide(slide),
        rawProblem: p
      };

      if (type === 'MultipleChoice') {
        const correct = p.Answer ?? null;
        const user = p.Result?.Answer ?? p.Result?.answer ?? null;
        const isCorrect = (correct != null && user != null) ? (String(correct) === String(user)) : null;
        const { choices, confidence } = mapChoicesByBullets(slide);
        const explanationText = extractRemarkText(p) || null;
        const stemAssets = collectStemAssetsFromSlide(slide);
        const choiceUrls = new Set(Object.values(choices || {}));
        const stemAsset = stemAssets.find(url => !choiceUrls.has(url)) || stemAssets[0] || null;

        problems.push({
          ...common,
          correctAnswer: correct,
          userAnswer: user,
          isCorrect,
          choiceAssets: choices,
          choiceAssetsConfidence: confidence,
          stemAsset: stemAsset,
          explanationText: explanationText
        });
        continue;
      }

      if (type === 'FillBlank') {
        const blanks = (p.Blanks || []).map(b => ({
          num: b.Num,
          answers: b.Answers || [],
          caseSensitive: b.CaseSensitive ?? false,
          fuzzyMatch: b.FuzzyMatch ?? false
        }));

        const userMap = p.Result?.Answer || {};
        const correctBlanks = p.Result?.CorrectBlanks || [];
        const finished = p.Result?.Finished ?? null;
        const correct = p.Result?.Correct ?? null;
        const score = p.Result?.Score ?? common.score ?? null;

        problems.push({
          ...common,
          blanks,
          orderInsensitive: p.OrderInsensitive ?? false,
          correctAnswerSummary: p.Answer ?? null,
          userAnswerMap: userMap,
          correctBlanks,
          finished,
          isCorrect: correct,
          resultScore: score
        });
        continue;
      }

      problems.push(common);
    }

    return {
      meta: {
        exportedAt: new Date().toISOString(),
        quizId: meta.quizID || detectQuizId(),
        showAnswer: meta.showAnswer ?? null,
        title: quizJson?.Title ?? null,
        language: quizJson?.Language ?? null,
        version: quizJson?.Version ?? null,
        slideCount: slides.length,
        problemCount: problems.length
      },
      problems
    };
  }

  function toMarkdownIframe(exportObj) {
    const m = exportObj.meta;
    const lines = [];

    lines.push(`# ${m.title || '试卷导出'}`);
    lines.push(`- quizId: \`${m.quizId || ''}\``);
    lines.push(`- exportedAt: \`${m.exportedAt}\``);
    lines.push(`- showAnswer: \`${m.showAnswer}\``);
    lines.push(`- slideCount: \`${m.slideCount}\``);
    lines.push(`- problemCount: \`${m.problemCount}\``);
    lines.push('');

    function formatImageUrl(url, alt, title) {
      if (!url) return `- ${alt}: (无URL)`;
      return `<img src="${url}" alt="${alt}" title="${title}" style="display: block; margin-left: 0; margin-right: auto; text-align: left;" />`;
    }

    for (const q of exportObj.problems) {
      lines.push(`## 第${q.no}题`);
      lines.push(`- 类型: \`${q.type}\``);
      if (q.problemId != null) lines.push(`- 题目ID: \`${q.problemId}\``);
      if (q.score != null) lines.push(`- 分值: \`${q.score}\``);

      if (q.type === 'MultipleChoice') {
        if (q.stemAsset) {
          lines.push('');
          lines.push('**题干**');
          lines.push('');
          lines.push(formatImageUrl(q.stemAsset, '题干图片', '题干'));
        }

        const choiceKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
        const hasChoices = choiceKeys.some(k => q.choiceAssets?.[k]);
        if (hasChoices) {
          lines.push('');
          lines.push('**选项**');
          for (const k of choiceKeys) {
            if (q.choiceAssets?.[k]) {
              lines.push('');
              lines.push(`**${k}.**`);
              lines.push(formatImageUrl(q.choiceAssets[k], k, `选项${k}`));
            }
          }
        }

        lines.push('');
        lines.push('**作答**');
        lines.push(`- 正确答案: \`${q.correctAnswer ?? ''}\``);
        lines.push(`- 你的答案: \`${q.userAnswer ?? ''}\``);
        lines.push(`- 是否正确: \`${q.isCorrect ?? ''}\``);

        if (q.explanationText) {
          lines.push('');
          lines.push('**解析**');
          lines.push('');
          lines.push(q.explanationText);
        }
      } else {
        if (q.assets && q.assets.length) {
          lines.push('');
          lines.push('**资源**');
          for (const u of q.assets) {
            lines.push(formatImageUrl(u, '资源图片', '资源'));
          }
        }
      }

      if (q.type === 'FillBlank') {
        lines.push('');
        lines.push('**作答**');
        lines.push(`- 顺序不敏感: \`${q.orderInsensitive}\``);
        lines.push(`- 是否正确: \`${q.isCorrect}\``);
        if (q.resultScore != null) lines.push(`- 得分: \`${q.resultScore}\``);

        lines.push('');
        lines.push('**空列表**');
        for (const b of (q.blanks || [])) {
          const user = q.userAnswerMap?.[String(b.num)] ?? q.userAnswerMap?.[b.num] ?? '';
          const ok = (q.correctBlanks || []).includes(b.num);
          lines.push(`- 空${b.num}:`);
          lines.push(`  - 你的答案: \`${user}\``);
          lines.push(`  - 正确: \`${ok}\``);
          lines.push(`  - 允许答案: ${b.answers.map(a => `\`${a}\``).join(' / ')}`);
          lines.push(`  - CaseSensitive: \`${b.caseSensitive}\`, FuzzyMatch: \`${b.fuzzyMatch}\``);
        }

        if (q.correctAnswerSummary) {
          lines.push('');
          lines.push('**题库汇总答案串（原样）**');
          lines.push('');
          lines.push(`\`${q.correctAnswerSummary}\``);
        }
      }

      lines.push('');
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }

  async function runExportIframe(format) {
    const quizId = detectQuizId();
    if (!quizId) {
      toast('未能从当前页面URL推断 quizId。\n请确保你在学生试卷页或 quiz_info 页打开。');
      return;
    }

    const actions = document.getElementById('__yuketang_export_actions__');
    const buttons = actions?.querySelectorAll('button') || [];
    buttons.forEach(btn => {
      btn.disabled = true;
      btn.textContent = '处理中...';
    });

    try {
      const html = await fetchQuizInfoHtml(quizId);
      const parsed = parseQuizInfoHtml(html);
      const exportObj = buildExportIframe(parsed);

      const baseName = `yuketang_quiz_${exportObj.meta.quizId || quizId}_${nowString()}`;

      if (format === 'json') {
        downloadText(`${baseName}.json`, JSON.stringify(exportObj, null, 2), 'application/json;charset=utf-8');
        toast('JSON 导出完成');
      } else if (format === 'md') {
        const md = toMarkdownIframe(exportObj);
        downloadText(`${baseName}.md`, md, 'text/markdown;charset=utf-8');
        toast('Markdown 导出完成');
      }
    } catch (e) {
      console.error(e);
      toast(`导出失败：${e?.message || e}`);
    } finally {
      buttons.forEach((btn, idx) => {
        btn.disabled = false;
        btn.textContent = idx === 0 ? '一键导出JSON' : '一键导出MD';
      });
    }
  }

  // ===========================
  // 模式2：无图试卷（normal）
  // ===========================
  function getExamIdFromUrl() {
    const u = new URL(location.href);
    const qid = u.searchParams.get('exam_id');
    if (qid) return qid;
    const m = u.pathname.match(/\/result\/(\d+)/);
    if (m) return m[1];
    const m2 = u.href.match(/exam_id=(\d+)/);
    if (m2) return m2[1];
    return null;
  }

  async function fetchJson(url) {
    const r = await fetch(url, { credentials: 'include' });
    if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
    return await r.json();
  }

  function normalizeExam(coverData, paperData, resultsData, examId) {
    const resList = (resultsData?.problem_results || []);
    const resMap = new Map(resList.map(r => [String(r.problem_id), r]));

    const problems = (paperData?.problems || []);
    const questions = problems.map((p, idx) => {
      const pid = String(p.problem_id ?? p.ProblemID ?? p.ProblemId ?? '');
      const pr = resMap.get(pid) || {};
      const options = (p.Options || []).map(o => ({
        key: o.key,
        text: o.value ? htmlToText(o.value) : ''
      }));

      const typeText = p.TypeText || p.Type || '';
      const correctAnswer = Array.isArray(p.Answer) ? p.Answer : [];
      const myAnswer = Array.isArray(pr.result) ? pr.result : [];

      return {
        index: idx + 1,
        problem_id: pid,
        problem_type: p.ProblemType ?? pr.problem_type ?? null,
        type_text: typeText,
        question: htmlToText(p.Body || ''),
        options,
        correct_answer: correctAnswer,
        my_answer: myAnswer,
        is_correct: typeof pr.correct === 'boolean' ? pr.correct : null,
        score: pr.grade ?? p.score ?? p.Score ?? null
      };
    });

    return {
      exam_id: String(examId),
      title: coverData?.title || paperData?.title || '',
      classroom_id: coverData?.classroom_id ?? null,
      university_id: coverData?.university_id ?? null,
      total_score: coverData?.total_score ?? null,
      problem_count: coverData?.problem_count ?? questions.length,
      show_answer: !!coverData?.show_answer,
      cover: coverData || {},
      summary: {
        grade: resultsData?.grade ?? null,
        duration: resultsData?.duration ?? null,
        create_time: resultsData?.create_time ?? null,
        submit_time: resultsData?.submit_time ?? null,
      },
      questions
    };
  }

  function toMarkdownNormal(normalized) {
    const lines = [];
    lines.push(`# ${normalized.title || 'Exam'}（exam_id=${normalized.exam_id}）`);
    lines.push('');
    lines.push(`- 成绩：${normalized.summary.grade ?? 'N/A'} / ${normalized.total_score ?? 'N/A'}`);
    lines.push(`- 题量：${normalized.questions.length}`);
    lines.push(`- 提交时间：${normalized.summary.submit_time ?? 'N/A'}`);
    lines.push('');

    normalized.questions.forEach(q => {
      lines.push(`## ${q.index}. ${q.type_text || ''}`.trim());
      lines.push('');
      lines.push(q.question || '');
      lines.push('');

      if (q.options?.length) {
        q.options.forEach(o => {
          const label = o.key ? `${o.key}. ` : '- ';
          lines.push(`${label}${o.text || ''}`.trim());
        });
        lines.push('');
      }

      if (normalized.show_answer && q.correct_answer?.length) {
        lines.push(`**正确答案：** ${q.correct_answer.join(', ')}`);
      } else {
        lines.push(`**正确答案：** （当前不允许导出/未开放）`);
      }

      if (q.my_answer?.length) {
        const mark = (q.is_correct === true) ? '✅' : (q.is_correct === false ? '❌' : '');
        lines.push(`**我的答案：** ${q.my_answer.join(', ')} ${mark}`.trim());
      } else {
        lines.push(`**我的答案：** （无记录）`);
      }

      lines.push('');
      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  }

  async function getExamData() {
    const examId = getExamIdFromUrl();
    if (!examId) {
      throw new Error('未从当前 URL 识别到 exam_id。请打开成绩/解析页（/result/xxxx 或 ?exam_id=xxxx）');
    }

    const coverUrl = `${HOST_EXAM}/exam_room/cover?exam_id=${examId}`;
    const cover = await fetchJson(coverUrl);
    if (cover?.errcode !== 0) throw new Error('cover err: ' + (cover?.errmsg || 'unknown'));

    const allowAnswer = !!cover?.data?.show_answer;

    const paperUrl = `${HOST_EXAM}/exam_room/show_paper?exam_id=${examId}`;
    const resultsUrl = `${HOST_EXAM}/exam_room/problem_results?exam_id=${examId}`;

    const paper = await fetchJson(paperUrl);
    if (paper?.errcode !== 0) throw new Error('show_paper err: ' + (paper?.errmsg || 'unknown'));

    const results = await fetchJson(resultsUrl);
    if (results?.errcode !== 0) throw new Error('problem_results err: ' + (results?.errmsg || 'unknown'));

    if (!allowAnswer && Array.isArray(paper?.data?.problems)) {
      paper.data.problems = paper.data.problems.map(p => ({ ...p, Answer: [] }));
    }

    const normalized = normalizeExam(cover.data, paper.data, results.data, examId);
    return { normalized, examId };
  }

  async function runExportNormal(format) {
    const actions = document.getElementById('__yuketang_export_actions__');
    const buttons = actions?.querySelectorAll('button') || [];
    buttons.forEach(btn => {
      btn.disabled = true;
      btn.textContent = '处理中...';
    });

    try {
      const { normalized, examId } = await getExamData();
      const safeTitle = (normalized.title || 'exam')
        .replace(/[\\/:*?"<>|]/g, '_')
        .slice(0, 50);

      if (format === 'md') {
        downloadText(`${safeTitle}_${examId}.md`, toMarkdownNormal(normalized), 'text/markdown;charset=utf-8');
        toast('Markdown 导出完成');
      } else if (format === 'json') {
        downloadText(`${safeTitle}_${examId}.json`, JSON.stringify(normalized, null, 2), 'application/json;charset=utf-8');
        toast('JSON 导出完成');
      }
    } catch (e) {
      console.error(e);
      toast('导出失败：' + e.message);
    } finally {
      buttons.forEach((btn, idx) => {
        btn.disabled = false;
        btn.textContent = idx === 0 ? '一键导出MD' : '一键导出JSON';
      });
    }
  }

  // ===========================
  // 初始化
  // ===========================
  function detectMode() {
    const hostname = location.hostname;
    const pathname = location.pathname;
    
    // 小窗试卷：yuketang.cn 的特定路径
    if ((hostname === 'www.yuketang.cn' || hostname === 'yuketang.cn') &&
        (pathname.includes('/v2/web/') || pathname.includes('/v/quiz/'))) {
      return 'iframe';
    }
    
    // 无图试卷：examination.xuetangx.com
    if (hostname === 'examination.xuetangx.com') {
      return 'normal';
    }
    
    // 默认无图试卷模式
    return 'normal';
  }

  async function isExtensionEnabled() {
    const enabled = await storageGet('extensionEnabled', true);
    return enabled !== false; // 默认开启
  }

  async function boot() {
    // 检查扩展是否启用
    const enabled = await isExtensionEnabled();
    if (!enabled) {
      // 如果已存在面板，移除它
      const existingPanel = document.getElementById('__yuketang_export_panel__');
      if (existingPanel) {
        existingPanel.remove();
      }
      return;
    }

    // 检测当前页面应该使用什么模式
    currentMode = detectMode();
    
    // 只在支持的页面显示面板
    if (currentMode === 'iframe') {
      // 小窗试卷模式：只在 yuketang.cn 的特定页面显示
      if (location.hostname !== 'www.yuketang.cn' && location.hostname !== 'yuketang.cn') {
        return;
      }
    } else {
      // 无图试卷模式：只在 examination.xuetangx.com 显示
      if (location.hostname !== 'examination.xuetangx.com') {
        return;
      }
    }
    
    // 延迟初始化，等待页面加载
    setTimeout(() => {
      initPanel();
    }, 1200);
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 监听页面变化（SPA）
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(boot, 500);
    }
  }).observe(document, { subtree: true, childList: true });

  // 监听存储变化（当用户在popup中切换开关时）
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.extensionEnabled) {
      boot();
    }
  });

  // 监听来自popup的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleChanged') {
      boot();
      sendResponse({ success: true });
    }
    return true;
  });

})();

