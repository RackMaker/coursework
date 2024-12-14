let vertices = [];
let edges = [];

function createVertexInputs() {
    const vertexCountInput = document.getElementById('vertex-count');
    vertexCountInput.addEventListener('input', function() {
        const value = vertexCountInput.value;
        vertexCountInput.value = value.replace(/[^\d]/g, '');
        if (vertexCountInput.value !== '' && !/^[1-9]\d*$/.test(vertexCountInput.value)) {
            showAlert('Пожалуйста, введите корректное количество вершин (целое положительное число без знаков препинания).');
        }
    });
    const count = vertexCountInput.value;
    const verticesInputDiv = document.getElementById('vertices-input');
    verticesInputDiv.innerHTML = '';
    if (count && /^[1-9]\d*$/.test(count)) {
        for (let i = 0; i < count; i++) {
            verticesInputDiv.innerHTML += `<input type="text" placeholder="Вершина ${i + 1}" id="vertex-${i}">`;
        }
        verticesInputDiv.innerHTML += '<button onclick="getVertices()">Далее</button>';
        verticesInputDiv.style.display = 'block';
    }
}
function getVertices() {
    const count = document.getElementById('vertex-count').value;
    vertices = [];
    const verticesSet = new Set(); 
    let validInput = true; 

    for (let i = 0; i < count; i++) {
        const vertex = document.getElementById(`vertex-${i}`).value.trim();
        
        if (!/^[\w\d]+$/.test(vertex)) { 
            showAlert(`Имя вершины "${vertex}" содержит недопустимые символы. Введите только буквы, цифры и символы подчеркивания.`);
            validInput = false; 
        } else if (vertex === "") {
            showAlert('Имя вершины не может быть пустым.');
            validInput = false;
        } else if (verticesSet.has(vertex)) {
            showAlert(`Вершина "${vertex}" уже существует. Введите уникальное имя.`);
            validInput = false; 
        } else {
            vertices.push(vertex);
            verticesSet.add(vertex);
        }
    }

    if (validInput) {
        createEdgeInputs();
    }
}

function createEdgeInputs() {
    const edgesInputDiv = document.getElementById('edges-input');
    edgesInputDiv.innerHTML = '';
    const edgeCount = prompt('Введите количество рёбер:');

    if (!/^[1-9]\d*$/.test(edgeCount)) {
        showAlert('Пожалуйста, введите корректное количество рёбер (целое положительное число).');
        return;
    }

    edgesInputDiv.style.display = 'grid';
    edgesInputDiv.style.gridTemplateColumns = '1fr 1fr';
    edgesInputDiv.style.gap = '20px';
    edgesInputDiv.style.padding = '20px';
    edgesInputDiv.style.marginTop = '20px'; 
    edgesInputDiv.style.border = '1px solid #ccc';
    edgesInputDiv.style.borderRadius = '5px';

    for (let i = 0; i < edgeCount; i++) {
        edgesInputDiv.innerHTML += `
            <div style="display: flex; gap: 20px; ${i > 0 ? 'margin-top: 10px;' : ''}">
                <select id="from-${i}" style="width: 100%; padding: 10px 20px; font-size: 16px; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); border: 1px solid #ccc; border-radius: 5px; color: white;">
                    <option value="" disabled selected style="background-color: #1b1b1b; color: #dcdcdc;">Выберите из вершины</option>
                    ${vertices.map(vertex => `<option value="${vertex}" style="background-color: #1b1b1b; color: #dcdcdc;">${vertex}</option>`).join('')}
                </select>
                <select id="to-${i}" style="width: 100%; padding: 10px 20px; font-size: 16px; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); border: 1px solid #ccc; border-radius: 5px; color: white;">
                    <option value="" disabled selected style="background-color: #1b1b1b; color: #dcdcdc;">Выберите в вершину</option>
                    ${vertices.map(vertex => `<option value="${vertex}" style="background-color: #1b1b1b; color: #dcdcdc;">${vertex}</option>`).join('')}
                </select>
            </div>`;
    }

    edgesInputDiv.innerHTML += '<button onclick="getEdges()" style="grid-column: span 2; padding: 10px 20px; font-size: 16px;">Сохранить рёбра</button>';
    edgesInputDiv.style.display = 'block';
    document.getElementById('find-cycles').style.display = 'block';
}

function getEdges() {
    edges = [];
    const edgeCount = document.querySelectorAll('#edges-input select').length / 2;
    for (let i = 0; i < edgeCount; i++) {
        const from = document.getElementById(`from-${i}`).value;
        const to = document.getElementById(`to-${i}`).value;
        edges.push([from, to]);
    }
    visualizeGraph(); 
}

function visualizeGraph() {
  if (edges.length === 0) {
    showAlert('Нет рёбер для визуализации.');
    return;
}
    const width = 600;
    const height = 400;

    const svg = d3.select("#graph").html("").append("svg")
        .attr("width", width)
        .attr("height", height);

    const nodes = vertices.map(vertex => ({ id: vertex }));
    const links = edges.map(([source, target]) => ({ source, target }));

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke", "#999")
        .style("stroke-width", 2);

    const node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .attr("r", 10)
        .style("fill", "#69b3a2");

    node.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(d => d.id)
        .style("fill", "#ffffff");

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}
  
function findCycles() {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '<h2>Найденные циклы</h2>';
    
    const uniqueVertices = new Set(edges.flat());
    if (uniqueVertices.size < 3) {
        outputDiv.innerHTML += '<p>Циклы не могут быть найдены. Требуется минимум три уникальные вершины.</p>';
    } else {
        const cycles = detectCycles(vertices, edges);
        if (cycles.length === 0) {
            outputDiv.innerHTML += '<p>Циклы не найдены.</p>';
        } else {
            cycles.forEach(cycle => {
                outputDiv.innerHTML += `<p>${cycle.join(' -> ')}</p>`;
            });
        }
    }

    outputDiv.style.display = 'block';
}

function detectCycles(vertices, edges) {
    const graph = {};
    vertices.forEach(vertex => graph[vertex] = []);
    edges.forEach(([from, to]) => graph[from].push(to));

    const uniqueCycles = new Set();
    const path = [];
    const visited = new Set();

    function dfs(vertex) {
        path.push(vertex);
        visited.add(vertex);

        for (const neighbor of graph[vertex]) {
            if (!visited.has(neighbor)) {
                dfs(neighbor);
            } else if (path.includes(neighbor)) {
                const cycleStartIndex = path.indexOf(neighbor);
                const cycle = path.slice(cycleStartIndex);

                if (cycle.length >= 3) {
                    const sortedCycle = [...cycle].sort();
                    uniqueCycles.add(sortedCycle.join(' -> '));
                }
            }
        }

        path.pop();
        visited.delete(vertex);
    }

    vertices.forEach(vertex => {
        if (!visited.has(vertex)) {
            dfs(vertex);
        }
    });

    return Array.from(uniqueCycles).map(cycle => cycle.split(' -> '));
}

function dragstarted(event, d) {
    d3.select(this).raise().classed("active", true);
}

function dragged(event, d) {
    d.x = event.x;
    d.y = event.y;
    d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
}

function dragended(event, d) {
    d3.select(this).classed("active", false);
}

function showAlert(message) {
    const alertBox = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    
    alertMessage.innerText = message;
    alertBox.style.display = 'block';

    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 3000);
}

function showEdgeModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.style.display = 'flex';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.zIndex = '1000';
    modalOverlay.style.left = '0';
    modalOverlay.style.top = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';

    const modalContent = document.createElement('div');
    modalContent.style.background = 'linear-gradient(145deg, #2b3c4c, #1e2a36)';
    modalContent.style.color = '#ffffff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '15px';
    modalContent.style.border = '3px solid';
    modalContent.style.borderImageSource = 'linear-gradient(135deg, #ff4c4c, #00ccff)';
    modalContent.style.borderImageSlice = '1';
    modalContent.style.maxWidth = '400px';
    modalContent.style.width = '90%';
    modalContent.style.boxShadow = '0 0 20px rgba(0, 204, 255, 0.5)';
    modalContent.style.textAlign = 'center';
    modalContent.style.fontFamily = 'Arial, sans-serif';

    modalContent.innerHTML = `
        <span style="color: #aaaaaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;" onclick="closeEdgeModal()">&times;</span>
        <h2 style="color: #00ccff; font-weight: bold; margin-bottom: 15px; text-shadow: 0 0 10px rgba(0, 204, 255, 0.7);">Введите количество рёбер</h2>
        <input type="text" id="edge-count" placeholder="Количество рёбер" style="width: 80%; padding: 12px; margin: 10px 0; border: 1px solid #444; border-radius: 10px; background: #2a2e36; color: #ffffff; font-size: 16px; box-shadow: 0 0 10px #00ccff; outline: none;">
        <button onclick="saveEdgeCount()" style="padding: 10px 20px; background: linear-gradient(135deg, #007acc, #005ea6); border: none; color: white; cursor: pointer; border-radius: 10px; font-weight: bold; font-size: 16px; transition: background-color 0.3s, transform 0.3s;">Сохранить</button>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

function closeEdgeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function saveEdgeCount() {
    const edgeCountInput = document.getElementById('edge-count');
    const edgeCount = edgeCountInput.value;

    if (!/^[1-9]\d*$/.test(edgeCount)) {
        showAlert('Пожалуйста, введите корректное количество рёбер (целое положительное число).');
    } else {
        closeEdgeModal();

        createEdgeInputs(edgeCount);
    }
    
}
