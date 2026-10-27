// Interactive terminal on the home page.
// Builds a small read-only filesystem from the site data (_data/*.yml, embedded as #term-data)
// and supports a handful of familiar commands: ls, cd, cat, grep, find, tree, head, tail, wc, ...
(function () {
  "use strict";

  var body = document.getElementById("term-body");
  var dataEl = document.getElementById("term-data");
  if (!body || !dataEl) return;

  var D;
  try { D = JSON.parse(dataEl.textContent); } catch (e) { return; }

  var USER = "aakash";
  var HOST = "soc";
  var HOME = "/home/" + USER;
  var titleEl = document.getElementById("term-title");

  // ---------- Filesystem ----------

  function dir() { return { type: "dir", children: {} }; }
  var root = dir();

  function mkdirp(path) {
    var node = root;
    path.split("/").filter(Boolean).forEach(function (part) {
      if (!node.children[part]) node.children[part] = dir();
      node = node.children[part];
    });
    return node;
  }

  function write(path, content, extra) {
    var i = path.lastIndexOf("/");
    var file = { type: "file", content: String(content).replace(/\s+$/, "") + "\n" };
    if (extra) for (var k in extra) file[k] = extra[k];
    mkdirp(path.slice(0, i)).children[path.slice(i + 1)] = file;
  }

  function slug(s) {
    s = String(s).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (s.length > 36) s = s.slice(0, 36).replace(/-[^-]*$/, "");
    return s || "untitled";
  }

  function wrap(text, width, indent) {
    width = width || 72;
    indent = indent || "";
    var lines = [], line = "";
    String(text || "").split(/\s+/).filter(Boolean).forEach(function (word) {
      if (line && (line + " " + word).length > width) { lines.push(line); line = indent + word; }
      else line = line ? line + " " + word : word;
    });
    if (line) lines.push(line);
    return lines.join("\n");
  }

  function bullets(items) {
    return (items || []).map(function (p) { return "- " + wrap(p, 70, "  "); }).join("\n");
  }

  function pad(s, n) { s = String(s); while (s.length < n) s += " "; return s; }

  var S = D.site || {};
  var L = S.links || {};
  var H = HOME + "/";
  var current = (D.experience || []).filter(function (j) { return j.current; })[0] || {};

  write(H + "about.txt", [
    S.name, "Detection Engineer · Threat Hunt & Cyber Detection · Morgan Stanley", "",
    (D.about || []).map(function (p) { return wrap(p); }).join("\n\n")
  ].join("\n"));

  write(H + "profile.yml", [
    "role:     Detection Engineer",
    "team:     Threat Hunt & Cyber Detection",
    "org:      Morgan Stanley",
    "focus:",
    "  - threat-hunting",
    "  - incident-response",
    "  - malware-analysis",
    "  - digital-forensics",
    "giac:     [GCFA, GNFA, GCIH, GCCC, GSEC, GFACT]",
    "location: Baltimore, MD"
  ].join("\n"));

  write(H + "contact.txt", [
    "email:    " + S.email,
    "linkedin: " + L.linkedin,
    "github:   " + L.github,
    "medium:   " + L.medium,
    "credly:   " + L.credly,
    "",
    "Tip: `open linkedin`, `open github`, `open resume` ..."
  ].join("\n"));

  write(H + "education.txt", (D.education || []).join("\n"));

  write(H + "skills.txt", (D.capabilities || []).map(function (c) {
    return "## " + c.name + " [" + c.op + "]\n" + wrap(c.summary) + "\ntools: " + (c.tools || []).join(", ");
  }).join("\n\n"));

  (D.experience || []).forEach(function (j) {
    var parts = [j.role, j.org, j.dates + " | " + j.location];
    if (j.current) parts.push("status: current");
    if (j.summary) parts.push("", wrap(j.summary));
    if (j.points) parts.push("", bullets(j.points));
    if (j.tags) parts.push("", "tags: " + j.tags.join(", "));
    write(H + "experience/" + slug(j.org) + ".txt", parts.join("\n"));
  });

  var certs = D.certifications || {};
  (certs.groups || []).forEach(function (g) {
    write(H + "certifications/" + slug(g.group) + ".txt", ["# " + g.group + " (" + g.items.length + ")", ""].concat(
      g.items.map(function (c) { return pad(c.abbr, 10) + c.name + (c.year ? "  [" + c.year + "]" : ""); })
    ).join("\n"));
  });
  if (certs.in_progress) {
    write(H + "certifications/in-progress.txt", certs.in_progress.map(function (c) {
      return pad(c.abbr, 10) + c.name;
    }).join("\n"));
  }

  (D.projects || []).forEach(function (p) {
    var parts = ["# " + p.title, "", wrap(p.summary)];
    if (p.points) parts.push("", bullets(p.points));
    parts.push("");
    if (p.repo) parts.push("repo: " + p.repo);
    if (p.tags) parts.push("tags: " + p.tags.join(", "));
    write(H + "projects/" + slug(p.title) + ".md", parts.join("\n"), { url: p.repo });
  });

  (D.updates || []).forEach(function (u) {
    var parts = ["# " + u.title];
    if (u.tag) parts.push(u.tag);
    if (u.summary) parts.push("", wrap(u.summary));
    if (u.points) parts.push("", bullets(u.points));
    write(H + "highlights/" + slug(u.title) + ".md", parts.join("\n"));
  });

  (D.talks || []).forEach(function (t) {
    var parts = ["# " + t.title, t.event + (t.location ? " | " + t.location : ""), "", wrap(t.summary)];
    if (t.points) parts.push("", bullets(t.points));
    if (t.url) parts.push("", "link: " + t.url);
    write(H + "talks/" + slug(t.title) + ".md", parts.join("\n"), { url: t.url });
  });

  var ctf = D.ctf || {};
  write(H + "ctf/results.txt", (ctf.highlights || []).map(function (c) {
    return pad(c.rank, 6) + c.event + (c.note ? " (" + c.note + ")" : "");
  }).join("\n"));
  write(H + "ctf/platforms.txt", (ctf.platforms || []).map(function (p) {
    return pad(p.name, 16) + p.note;
  }).join("\n"));

  write(H + "writing/articles.txt", (D.writing || []).map(function (w) {
    return pad(w.date || "Earlier", 10) + w.title + "  [" + w.tag + "]\n" + pad("", 10) + w.url;
  }).join("\n"));

  write(H + "resume.pdf", "", { binary: true, url: S.resume });
  write(H + ".bash_history", [
    "cat about.txt", "ls -la experience", "grep -ri sigma .", "find . -name '*.md'", "cat ctf/results.txt", "open resume"
  ].join("\n"));
  write(H + ".flag", [
    "FLAG{y0u_hunt3d_th3_h1dd3n_f1l3}",
    "",
    "Nice find. Hidden files are always worth a look during triage.",
    "Say hi: " + S.email
  ].join("\n"));
  write("/etc/hostname", HOST);
  write("/etc/motd", "Welcome to " + HOST + ". All activity is logged (and probably hunted).");

  // ---------- Paths ----------

  var cwd = HOME;

  function resolve(p) {
    if (p === undefined || p === "") return cwd;
    if (p === "~" || p.indexOf("~/") === 0) p = HOME + p.slice(1);
    else if (p.charAt(0) !== "/") p = cwd + "/" + p;
    var out = [];
    p.split("/").forEach(function (part) {
      if (!part || part === ".") return;
      if (part === "..") out.pop(); else out.push(part);
    });
    return "/" + out.join("/");
  }

  function lookup(abs) {
    var node = root;
    var parts = abs.split("/").filter(Boolean);
    for (var i = 0; i < parts.length; i++) {
      if (!node || node.type !== "dir") return null;
      node = node.children[parts[i]];
    }
    return node || null;
  }

  function pretty(abs) {
    if (abs === HOME) return "~";
    if (abs.indexOf(HOME + "/") === 0) return "~" + abs.slice(HOME.length);
    return abs;
  }

  function names(node, all) {
    return Object.keys(node.children).filter(function (n) { return all || n.charAt(0) !== "."; }).sort();
  }

  // Visits every node below `node`; `label` is how the starting path is displayed.
  function walk(node, label, depth, visit) {
    visit(label, node, depth);
    if (node.type !== "dir") return;
    names(node, true).forEach(function (n) {
      walk(node.children[n], label === "" ? n : label.replace(/\/$/, "") + "/" + n, depth + 1, visit);
    });
  }

  function globRe(glob, flags) {
    var re = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]");
    return new RegExp("^" + re + "$", flags);
  }

  // Expands an unquoted argument such as `projects/*.md`. Only the last path segment may contain wildcards.
  function expandGlob(arg) {
    if (!/[*?]/.test(arg)) return [arg];
    var i = arg.lastIndexOf("/");
    var base = i >= 0 ? arg.slice(0, i + 1) : "";
    var node = lookup(resolve(base || "."));
    if (!node || node.type !== "dir") return [arg];
    var re = globRe(arg.slice(i + 1));
    var hits = names(node, arg.charAt(i + 1) === ".").filter(function (n) { return re.test(n); });
    return hits.length ? hits.map(function (n) { return base + n; }) : [arg];
  }

  // ---------- Parsing ----------

  // Splits a command line into pipeline stages of tokens: [[{v, q}, ...], ...]
  function parse(line) {
    var stages = [[]], tok = null, quote = null;
    function push() { if (tok) stages[stages.length - 1].push(tok); tok = null; }
    for (var i = 0; i < line.length; i++) {
      var ch = line.charAt(i);
      if (quote) {
        if (ch === quote) quote = null;
        else if (ch === "\\" && quote === '"' && i + 1 < line.length) tok.v += line.charAt(++i);
        else tok.v += ch;
      } else if (ch === "'" || ch === '"') {
        quote = ch; tok = tok || { v: "", q: false }; tok.q = true;
      } else if (ch === "\\" && i + 1 < line.length) {
        tok = tok || { v: "", q: false }; tok.v += line.charAt(++i); tok.q = true;
      } else if (/\s/.test(ch)) {
        push();
      } else if (ch === "|") {
        push(); stages.push([]);
      } else {
        tok = tok || { v: "", q: false }; tok.v += ch;
      }
    }
    push();
    return stages;
  }

  // Separates single-letter flags (-la -> l, a) from operands. `withValue` lists flags that take an argument.
  function opts(args, withValue) {
    var flags = {}, rest = [];
    withValue = withValue || "";
    for (var i = 0; i < args.length; i++) {
      var a = args[i];
      if (a === "--") { rest = rest.concat(args.slice(i + 1)); break; }
      if (/^-\d+$/.test(a)) { flags.n = a.slice(1); continue; }
      if (a.length > 1 && a.charAt(0) === "-") {
        for (var j = 1; j < a.length; j++) {
          var f = a.charAt(j);
          if (withValue.indexOf(f) >= 0) {
            flags[f] = a.length > j + 1 ? a.slice(j + 1) : args[++i];
            break;
          }
          flags[f] = true;
        }
      } else rest.push(a);
    }
    return { f: flags, args: rest };
  }

  // ---------- Commands ----------

  function ok(out, extra) { var r = { out: out || "", err: "" }; if (extra) for (var k in extra) r[k] = extra[k]; return r; }
  function fail(err, out) { return { out: out || "", err: err }; }

  // Reads file operands, or stdin when there are none.
  function inputs(cmd, files, stdin) {
    if (!files.length) return { text: stdin || "", errs: [] };
    var text = "", errs = [];
    files.forEach(function (f) {
      var node = lookup(resolve(f));
      if (!node) errs.push(cmd + ": " + f + ": No such file or directory");
      else if (node.type === "dir") errs.push(cmd + ": " + f + ": Is a directory");
      else text += node.binary ? "" : node.content;
    });
    return { text: text, errs: errs };
  }

  function lines(text) {
    if (!text) return [];
    var l = text.split("\n");
    if (l[l.length - 1] === "") l.pop();
    return l;
  }

  var HELP = [
    ["help", "show this list"],
    ["ls [-la] [path]", "list a directory"],
    ["cd [dir]", "change directory (cd .. / cd ~)"],
    ["pwd", "print working directory"],
    ["cat <file...>", "print files"],
    ["grep [-rinvlc] <pattern> [path...]", "search text (regex)"],
    ["find [path] [-name glob] [-type f|d]", "find files"],
    ["tree [path]", "show the directory tree"],
    ["head / tail [-n N] [file]", "first / last lines"],
    ["wc [-lwc] [file]", "count lines, words, bytes"],
    ["sort [-r] / uniq", "sort or dedupe lines"],
    ["echo <text>", "print text"],
    ["open <name|file>", "open linkedin, github, medium, credly, resume, or a project/talk file"],
    ["whoami, id, hostname, uname -a, date", "system info"],
    ["history, clear", "shell history, clear the screen"]
  ];

  var commands = {
    help: function () {
      var w = 0;
      HELP.forEach(function (h) { w = Math.max(w, h[0].length); });
      return ok(["Available commands (pipes work, e.g. `cat skills.txt | grep -i yara`):", ""].concat(
        HELP.map(function (h) { return "  " + pad(h[0], w + 2) + h[1]; })
      ).concat(["", "Start with `ls`, then `cat about.txt`."]).join("\n"));
    },

    ls: function (args, stdin, piped) {
      var o = opts(args);
      var targets = o.args.length ? o.args : ["."];
      var out = [], errs = [];
      targets.forEach(function (t, idx) {
        var node = lookup(resolve(t));
        if (!node) { errs.push("ls: cannot access '" + t + "': No such file or directory"); return; }
        var entries = node.type === "dir" ? names(node, o.f.a).map(function (n) { return [n, node.children[n]]; }) : [[t, node]];
        if (targets.length > 1 && node.type === "dir") out.push((idx ? "\n" : "") + t + ":");
        if (o.f.l) {
          entries.forEach(function (e) {
            var isDir = e[1].type === "dir";
            var size = isDir ? 4096 : (e[1].binary ? 251339 : e[1].content.length);
            out.push((isDir ? "drwxr-xr-x" : "-r--r--r--") + "  " + USER + "  " + pad(size, 7) + e[0] + (isDir ? "/" : ""));
          });
        } else if (piped || o.f["1"]) {
          entries.forEach(function (e) { out.push(e[0]); });
        } else {
          out.push(entries.map(function (e) { return e[0] + (e[1].type === "dir" ? "/" : ""); }).join("  "));
        }
      });
      return { out: out.join("\n"), err: errs.join("\n"), mode: "ls" };
    },

    cd: function (args) {
      var target = resolve(args[0] === undefined ? "~" : args[0]);
      var node = lookup(target);
      if (!node) return fail("cd: " + args[0] + ": No such file or directory");
      if (node.type !== "dir") return fail("cd: " + args[0] + ": Not a directory");
      cwd = target;
      if (titleEl) titleEl.textContent = USER + "@" + HOST + ": " + pretty(cwd);
      return ok();
    },

    pwd: function () { return ok(cwd); },

    cat: function (args, stdin) {
      if (!args.length) return ok(stdin);
      var out = "", errs = [];
      args.forEach(function (f) {
        var node = lookup(resolve(f));
        if (!node) errs.push("cat: " + f + ": No such file or directory");
        else if (node.type === "dir") errs.push("cat: " + f + ": Is a directory");
        else if (node.binary) errs.push("cat: " + f + ": binary file; try `open resume`");
        else out += node.content;
      });
      return { out: out, err: errs.join("\n") };
    },

    head: function (args, stdin) { return headTail("head", args, stdin); },
    tail: function (args, stdin) { return headTail("tail", args, stdin); },

    wc: function (args, stdin) {
      var o = opts(args);
      var input = inputs("wc", o.args, stdin);
      var t = input.text;
      var counts = { l: lines(t).length, w: t.split(/\s+/).filter(Boolean).length, c: t.length };
      var pick = ["l", "w", "c"].filter(function (k) { return o.f[k]; });
      if (!pick.length) pick = ["l", "w", "c"];
      var out = pick.map(function (k) { return counts[k]; }).join("  ");
      if (o.args.length === 1) out += " " + o.args[0];
      return { out: out, err: input.errs.join("\n") };
    },

    sort: function (args, stdin) {
      var o = opts(args);
      var input = inputs("sort", o.args, stdin);
      var l = lines(input.text).sort(function (a, b) { return a.localeCompare(b); });
      if (o.f.r) l.reverse();
      return { out: l.join("\n"), err: input.errs.join("\n") };
    },

    uniq: function (args, stdin) {
      var o = opts(args);
      var input = inputs("uniq", o.args, stdin);
      var l = lines(input.text).filter(function (line, i, all) { return i === 0 || line !== all[i - 1]; });
      return { out: l.join("\n"), err: input.errs.join("\n") };
    },

    grep: function (args, stdin) {
      var o = opts(args, "e");
      var pattern = o.f.e !== undefined ? o.f.e : o.args.shift();
      if (pattern === undefined) return fail("usage: grep [-rinvlc] <pattern> [path...]");
      var re, flags = o.f.i ? "i" : "";
      try { re = new RegExp(pattern, flags); } catch (e) { re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags); }
      var recursive = o.f.r || o.f.R;
      var paths = o.args;
      var errs = [], sources = [];

      if (!paths.length && !recursive) {
        sources.push({ name: "", text: stdin || "" });
      } else {
        if (!paths.length) paths = [""];
        paths.forEach(function (p) {
          var node = lookup(resolve(p || "."));
          if (!node) { errs.push("grep: " + p + ": No such file or directory"); return; }
          if (node.type === "dir" && !recursive) { errs.push("grep: " + p + ": Is a directory"); return; }
          walk(node, p, 0, function (label, n) {
            if (n.type === "file" && !n.binary) sources.push({ name: label, text: n.content });
          });
        });
      }

      var showName = recursive || sources.length > 1;
      var out = [];
      sources.forEach(function (src) {
        var hits = 0;
        lines(src.text).forEach(function (line, i) {
          if (re.test(line) === !!o.f.v) return;
          hits++;
          if (o.f.l || o.f.c) return;
          out.push((showName ? src.name + ":" : "") + (o.f.n ? (i + 1) + ":" : "") + line);
        });
        if (o.f.l && hits) out.push(src.name || "(standard input)");
        if (o.f.c) out.push((showName ? src.name + ":" : "") + hits);
      });
      return { out: out.join("\n"), err: errs.join("\n"), hl: o.f.v || o.f.l || o.f.c ? null : new RegExp(re.source, flags + "g") };
    },

    find: function (args) {
      var starts = [], tests = [], errs = [], maxDepth = Infinity;
      for (var i = 0; i < args.length; i++) {
        var a = args[i];
        if (a === "-name" || a === "-iname") {
          var re = globRe(args[++i] || "", a === "-iname" ? "i" : "");
          tests.push(function (re) { return function (label) { return re.test(label.split("/").pop()); }; }(re));
        } else if (a === "-type") {
          var t = args[++i];
          tests.push(function (t) { return function (label, n) { return (t === "d") === (n.type === "dir"); }; }(t));
        } else if (a === "-maxdepth") {
          maxDepth = parseInt(args[++i], 10);
        } else if (a.charAt(0) === "-") {
          return fail("find: unknown predicate '" + a + "'");
        } else starts.push(a);
      }
      if (!starts.length) starts = ["."];
      var out = [];
      starts.forEach(function (s) {
        var node = lookup(resolve(s));
        if (!node) { errs.push("find: '" + s + "': No such file or directory"); return; }
        walk(node, s, 0, function (label, n, depth) {
          if (depth > maxDepth) return;
          if (tests.every(function (test) { return test(label, n); })) out.push(label);
        });
      });
      return { out: out.join("\n"), err: errs.join("\n") };
    },

    tree: function (args) {
      var o = opts(args);
      var start = o.args[0] || ".";
      var node = lookup(resolve(start));
      if (!node) return fail("tree: " + start + ": No such file or directory");
      var out = [start], dirs = 0, files = 0;
      (function draw(n, prefix) {
        var kids = names(n, o.f.a);
        kids.forEach(function (k, i) {
          var child = n.children[k], last = i === kids.length - 1;
          if (child.type === "dir") dirs++; else files++;
          out.push(prefix + (last ? "└── " : "├── ") + k + (child.type === "dir" ? "/" : ""));
          if (child.type === "dir") draw(child, prefix + (last ? "    " : "│   "));
        });
      })(node, "");
      out.push("", dirs + " directories, " + files + " files");
      return { out: out.join("\n"), err: "", mode: "ls" };
    },

    echo: function (args) {
      return ok(args.join(" ").replace(/\$USER\b/g, USER).replace(/\$HOME\b/g, HOME).replace(/\$PWD\b/g, cwd).replace(/\$SHELL\b/g, "/bin/bash"));
    },

    whoami: function () { return ok(USER); },
    id: function () { return ok("uid=1000(" + USER + ") gid=1000(" + USER + ") groups=1000(" + USER + "),4(adm),1001(blueteam),1002(purpleteam)"); },
    hostname: function () { return ok(HOST); },
    uname: function (args) { return ok(args.indexOf("-a") >= 0 ? "Linux " + HOST + " 6.8.0-dfir #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux" : "Linux"); },
    date: function () { return ok(new Date().toString()); },

    history: function () {
      return ok(history.map(function (h, i) { return pad(i + 1, 5) + h; }).join("\n"));
    },

    open: function (args) {
      var t = args[0];
      if (!t) return fail("usage: open <linkedin|github|medium|credly|resume|file>");
      var url = L[t.toLowerCase()] || (t.toLowerCase() === "resume" ? S.resume : null);
      if (!url) {
        var node = lookup(resolve(t));
        if (node && node.url) url = node.url;
        else if (/^https?:\/\//.test(t)) url = t;
      }
      if (!url) return fail("open: " + t + ": nothing to open");
      window.open(url, "_blank", "noopener");
      return ok("Opening " + url + " ...");
    },

    man: function (args) {
      var hit = HELP.filter(function (h) { return args[0] && h[0].split(/[\s,/]+/).indexOf(args[0]) >= 0; })[0];
      return hit ? ok(hit[0] + "\n    " + hit[1]) : fail("No manual entry for " + (args[0] || "(nothing)") + ". Try `help`.");
    },

    sudo: function () { return fail(USER + " is not in the sudoers file. This incident will be reported."); },
    exit: function () { return ok("There is no escape from the SOC. (Try `clear`.)"); }
  };
  commands.logout = commands.exit;
  commands.ll = function (args, stdin, piped) { return commands.ls(["-la"].concat(args), stdin, piped); };
  ["rm", "mv", "cp", "touch", "mkdir", "rmdir", "chmod", "vim", "vi", "nano", "tee"].forEach(function (c) {
    commands[c] = function () { return fail(c + ": Read-only file system (this evidence image is write-blocked)"); };
  });

  function headTail(cmd, args, stdin) {
    var o = opts(args, "n");
    var n = parseInt(o.f.n === undefined ? 10 : o.f.n, 10);
    if (isNaN(n)) return fail(cmd + ": invalid number of lines");
    var input = inputs(cmd, o.args, stdin);
    var l = lines(input.text);
    l = cmd === "head" ? l.slice(0, n) : l.slice(Math.max(0, l.length - n));
    return { out: l.join("\n"), err: input.errs.join("\n") };
  }

  // ---------- Execution ----------

  var history = [];

  function run(line) {
    var stages = parse(line).filter(function (s) { return s.length; });
    if (!stages.length) return null;
    var stdin = "", result = null, errs = [];
    for (var i = 0; i < stages.length; i++) {
      var name = stages[i][0].v;
      var noGlob = name === "find" || name === "grep";
      var args = [];
      stages[i].slice(1).forEach(function (t) {
        args = args.concat(t.q || noGlob ? [t.v] : expandGlob(t.v));
      });
      var fn = Object.prototype.hasOwnProperty.call(commands, name) ? commands[name] : null;
      if (name === "clear") return { clear: true };
      result = fn ? fn(args, stdin, i < stages.length - 1)
                  : fail(name + ": command not found. Type `help` to see what's available.");
      if (result.err) errs.push(result.err);
      stdin = result.out ? result.out.replace(/\n?$/, "\n") : "";
    }
    result.err = errs.join("\n");
    return result;
  }

  // ---------- Rendering ----------

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function promptHtml() {
    return '<span class="k">' + esc(pretty(cwd)) + '</span> <span class="p">$</span> ';
  }

  var form = document.createElement("form");
  form.className = "term-line";
  form.innerHTML = '<span class="term-prompt"></span><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command">';
  var promptEl = form.firstChild;
  var input = form.lastChild;

  var output = document.createElement("div");
  output.setAttribute("aria-live", "polite");

  function print(html) {
    var pre = document.createElement("pre");
    pre.innerHTML = html;
    output.appendChild(pre);
  }

  function render(res) {
    if (res.out) {
      var text = res.out.replace(/\n$/, "");
      var html = esc(text);
      if (res.mode === "ls") {
        html = html.replace(/(^|\s|── )([^\s]+\/)(?=\s|$)/gm, '$1<span class="d">$2</span>');
      } else if (res.hl) {
        html = text.split("\n").map(function (line) {
          var outLine = "", last = 0, m;
          res.hl.lastIndex = 0;
          while ((m = res.hl.exec(line)) && m[0].length) {
            outLine += esc(line.slice(last, m.index)) + "<mark>" + esc(m[0]) + "</mark>";
            last = m.index + m[0].length;
          }
          return outLine + esc(line.slice(last));
        }).join("\n");
      }
      print(html);
    }
    if (res.err) print('<span class="e">' + esc(res.err) + "</span>");
  }

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function updatePrompt() { promptEl.innerHTML = promptHtml(); }

  var idle = document.getElementById("term-idle");
  if (idle) idle.parentNode.removeChild(idle);
  print('<span class="m">Interactive shell. Try `help`, `ls`, `cat about.txt`, `grep -ri splunk .`, or `find . -name "*.md"`.</span>');
  body.appendChild(output);
  body.appendChild(form);
  updatePrompt();

  var histIdx = 0;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var line = input.value;
    print(promptHtml() + esc(line));
    input.value = "";
    if (line.trim()) {
      history.push(line);
      var res = run(line);
      if (res && res.clear) output.innerHTML = "";
      else if (res) render(res);
    }
    histIdx = history.length;
    updatePrompt();
    scrollDown();
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (!history.length) return;
      e.preventDefault();
      histIdx = Math.max(0, Math.min(history.length, histIdx + (e.key === "ArrowUp" ? -1 : 1)));
      input.value = history[histIdx] || "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
      e.preventDefault();
      output.innerHTML = "";
    } else if (e.ctrlKey && (e.key === "c" || e.key === "C") && !window.getSelection().toString()) {
      e.preventDefault();
      print(promptHtml() + esc(input.value) + "^C");
      input.value = "";
      scrollDown();
    }
  });

  function commonPrefix(list) {
    return list.reduce(function (a, b) {
      var i = 0;
      while (i < a.length && a.charAt(i) === b.charAt(i)) i++;
      return a.slice(0, i);
    });
  }

  function complete() {
    var value = input.value;
    var m = value.match(/(\S*)$/);
    var partial = m[1];
    var head = value.slice(0, value.length - partial.length);
    var candidates;

    if (!head.trim()) {
      candidates = Object.keys(commands).concat(["clear"]).filter(function (c) { return c.indexOf(partial) === 0; }).sort();
      candidates = candidates.map(function (c) { return { text: c, full: c + " " }; });
    } else {
      var slash = partial.lastIndexOf("/");
      var dirPart = slash >= 0 ? partial.slice(0, slash + 1) : "";
      var base = partial.slice(slash + 1);
      var node = lookup(resolve(dirPart || "."));
      if (!node || node.type !== "dir") return;
      candidates = names(node, base.charAt(0) === ".").filter(function (n) { return n.indexOf(base) === 0; }).map(function (n) {
        var isDir = node.children[n].type === "dir";
        return { text: n + (isDir ? "/" : ""), full: dirPart + n + (isDir ? "/" : " ") };
      });
    }

    if (!candidates.length) return;
    if (candidates.length === 1) { input.value = head + candidates[0].full; return; }
    var prefix = commonPrefix(candidates.map(function (c) { return c.full; }));
    if (prefix.length > partial.length) { input.value = head + prefix; return; }
    print(promptHtml() + esc(value));
    print(esc(candidates.map(function (c) { return c.text; }).join("  ")));
    scrollDown();
  }

  body.addEventListener("click", function () {
    if (!window.getSelection().toString()) input.focus({ preventScroll: true });
  });
})();
