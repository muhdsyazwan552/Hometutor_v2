import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportSessionsToPdf = (sessions, subtopicName, questionType) => {
    const doc = new jsPDF();

    const generatedDate = new Date();
    const generatedDateStr = generatedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    const generatedTimeStr = generatedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Title
    doc.setFontSize(16);
    doc.text(`${subtopicName}`, 14, 15);

    // Subtitle with question type
    doc.setFontSize(11);
    doc.text(`Question Type: ${questionType}`, 14, 23);
    doc.text(`Generated on: ${generatedDateStr}, ${generatedTimeStr}`, 14, 30);

    // Define table columns - REMOVED "Total Questions" column
    const columns = [
        { header: 'No', dataKey: 'index' },
        { header: questionType === 'Objective' ? 'Correct' : 'Answered', dataKey: 'total_correct' },
    ];

    if (questionType === 'Objective') {
        columns.push({ header: 'Wrong', dataKey: 'total_wrong' });
    }

    columns.push(
        { header: 'Skipped', dataKey: 'total_skipped' },
        { header: 'Score', dataKey: 'score' },
        { header: 'Time Spent', dataKey: 'total_time' },
        { header: 'Avg Time', dataKey: 'average_time' },
        { header: 'Session Date', dataKey: 'session_date' }
    );

    // Prepare data for the table
    const tableData = sessions.map((session, index) => {
        // Convert to numbers, default to 0 if null/undefined
        const totalCorrect = Number(session.total_correct) || 0;
        const totalSkipped = Number(session.total_skipped) || 0;
        const totalWrong = Number(session.total_wrong) || 0;

        // Parse score from string if needed
        let scoreValue = '0%';
        if (session.score) {
            if (typeof session.score === 'string') {
                // Remove % sign if present and convert to number
                const scoreNum = parseFloat(session.score.replace('%', ''));
                scoreValue = !isNaN(scoreNum) ? `${scoreNum}%` : '0%';
            } else {
                // If it's already a number
                scoreValue = `${parseFloat(session.score)}%`;
            }
        }

        // Format the session date with date above time
        let formattedDate = '-';
        if (session.session_date) {
            const date = new Date(session.session_date);
            if (!isNaN(date.getTime())) {
                // Date above, time below format
                const datePart = date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                const timePart = date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                // Use line break for date above time
                formattedDate = `${datePart}\n${timePart}`;
            }
        }

        const row = {
            index: index + 1,
            total_correct: totalCorrect,
            total_skipped: totalSkipped,
            total_time: session.total_time || '0 min 0 secs',
            average_time: session.average_time || '0 min 0 secs',
            session_date: formattedDate, // Use formatted date with line break
            score: scoreValue
        };

        if (questionType === 'Objective') {
            row.total_wrong = totalWrong;
        }

        return row;
    });

    // DEBUG: Log the data to console to check values
    console.log('PDF Export Data:', {
        sessions,
        tableData,
        questionType
    });

    // Define column styles with colors
    const columnStyles = {
        0: { cellWidth: 15, halign: 'center' }, // No
        1: { cellWidth: 20, fillColor: [220, 252, 231], halign: 'center', fontStyle: 'bold' }, // Correct - Light green
    };

    if (questionType === 'Objective') {
        columnStyles[2] = { cellWidth: 20, fillColor: [254, 226, 226], halign: 'center', fontStyle: 'bold' }; // Wrong - Light red
        columnStyles[3] = { cellWidth: 20, fillColor: [254, 249, 195], halign: 'center', fontStyle: 'bold' }; // Skipped - Light orange
        columnStyles[4] = { cellWidth: 20, halign: 'center', fontStyle: 'bold' }; // Score
        columnStyles[5] = { cellWidth: 30, halign: 'center' }; // Time Spent
        columnStyles[6] = { cellWidth: 25, halign: 'center' }; // Avg Time
        columnStyles[7] = {
            cellWidth: 40,
            halign: 'center',
            valign: 'middle', // Add vertical alignment
            cellPadding: { top: 2, right: 2, bottom: 2, left: 2 } // Add padding
        };
    } else {
        columnStyles[2] = { cellWidth: 20, fillColor: [254, 249, 195], halign: 'center', fontStyle: 'bold' }; // Skipped - Light orange
        columnStyles[3] = { cellWidth: 20, halign: 'center', fontStyle: 'bold' }; // Score
        columnStyles[4] = { cellWidth: 30, halign: 'center' }; // Time Spent
        columnStyles[5] = { cellWidth: 25, halign: 'center' }; // Avg Time
        columnStyles[6] = {
            cellWidth: 40,
            halign: 'center',
            valign: 'middle', // Add vertical alignment
            cellPadding: { top: 2, right: 2, bottom: 2, left: 2 } // Add padding
        };
    }

    // Add the table - FIX: Ensure all values are strings
    autoTable(doc, {
        head: [columns.map(col => col.header)],
        body: tableData.map(row => {
            return columns.map(col => {
                const value = row[col.dataKey];
                // Convert all values to strings
                return value !== undefined && value !== null ? String(value) : '0';
            });
        }),
        startY: 40,
        styles: {
            fontSize: 9,
            cellPadding: 3, // Increased padding for better visibility
            lineColor: [0, 0, 0],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [242, 242, 242], // Gray color for header
            textColor: [77, 77, 77],
            fontStyle: 'bold',
            halign: 'center',
            lineColor: [0, 0, 0],
            lineWidth: 0.0
        },
        bodyStyles: {
            halign: 'center',
            lineColor: [204, 204, 204],
            lineWidth: 0.05,
            fontStyle: 'normal'
        },
        columnStyles: columnStyles,
        margin: { top: 40 }
    });

    // Add summary statistics
    const finalY = doc.lastAutoTable.finalY || 70;
    doc.setFontSize(11);
    doc.text('Summary Statistics:', 14, finalY + 10);

    const totalSessions = sessions.length;
    const totalCorrect = sessions.reduce((sum, session) => sum + (Number(session.total_correct) || 0), 0);
    const totalWrong = sessions.reduce((sum, session) => sum + (Number(session.total_wrong) || 0), 0);
    const totalSkipped = sessions.reduce((sum, session) => sum + (Number(session.total_skipped) || 0), 0);

    let summaryText = `Total Sessions: ${totalSessions}`;

    if (questionType === 'Objective') {
        summaryText += ` | Correct: ${totalCorrect} | Wrong: ${totalWrong} | Skipped: ${totalSkipped}`;
    } else {
        summaryText += ` | Answered: ${totalCorrect} | Skipped: ${totalSkipped}`;
    }

    doc.setFontSize(10);
    doc.text(summaryText, 14, finalY + 18);

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width - 30,
            doc.internal.pageSize.height - 10
        );
    }

    // Generate PDF as data URL and open in new tab
    const pdfDataUri = doc.output('datauristring');

    // Open PDF in new tab (no auto-print)
    const newWindow = window.open();
    newWindow.document.write(`
    <html>
      <head>
        <title>${subtopicName} - Session History</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            font-family: Arial, sans-serif;
          }
          .pdf-container {
            width: 100%;
            height: 100vh;
          }
          .pdf-viewer {
            width: 100%;
            height: 100vh;
            border: none;
          }
        </style>
      </head>
      <body>
        <div class="pdf-container">
          <iframe class="pdf-viewer" src="${pdfDataUri}"></iframe>
        </div>
      </body>
    </html>
  `);
    newWindow.document.close();
};