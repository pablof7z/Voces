// 3D Vector World Animation - The Thirteenth Floor Style
class VectorWorld {
    constructor() {
        this.canvas = document.getElementById('worldCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Sphere parameters - positioned at bottom, only top 20vh visible
        this.sphereRadius = window.innerWidth * 1.2; // Very large sphere
        this.rotation = { x: 0, y: 0, z: 0 };
        this.rotationSpeed = { x: 0.0003, y: 0.0006, z: 0.0002 }; // Very slow rotation

        // Position sphere at bottom of screen - adjusted to show only top portion
        this.sphereCenterY = this.canvas.height + this.sphereRadius * 0.7; // Most of sphere is below viewport

        // Create sparse sphere points for abstract look
        this.points = this.createSpherePoints(30, 60); // Fewer latitude lines, more longitude for spread

        // Animation
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;

        // Recalculate sphere position
        this.sphereRadius = window.innerWidth * 1.2;
        this.sphereCenterY = this.canvas.height + this.sphereRadius * 0.7;
    }

    createSpherePoints(latLines, lonLines) {
        const points = [];

        // Only create points for the top portion of the sphere (visible part)
        // We'll focus on the top 50% of the sphere to ensure visibility
        for (let lat = 0; lat <= latLines * 0.55; lat++) { // Increased to show more
            const theta = (lat * Math.PI) / latLines;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= lonLines; lon++) {
                const phi = (lon * 2 * Math.PI) / lonLines;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                points.push({
                    x: x * this.sphereRadius,
                    y: y * this.sphereRadius,
                    z: z * this.sphereRadius,
                    lat,
                    lon
                });
            }
        }

        return points;
    }

    rotateX(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const y = point.y * cos - point.z * sin;
        const z = point.y * sin + point.z * cos;
        return { x: point.x, y, z };
    }

    rotateY(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = point.x * cos + point.z * sin;
        const z = -point.x * sin + point.z * cos;
        return { x, y: point.y, z };
    }

    rotateZ(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = point.x * cos - point.y * sin;
        const y = point.x * sin + point.y * cos;
        return { x, y, z: point.z };
    }

    project(point) {
        // Simple perspective projection
        const fov = 600;
        const distance = 800;
        const scale = fov / (fov + point.z + distance);

        return {
            x: point.x * scale + this.centerX,
            y: point.y * scale + this.sphereCenterY,
            z: point.z,
            scale
        };
    }

    draw() {
        // Clear canvas with slight trail effect
        this.ctx.fillStyle = 'rgba(5, 5, 7, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update rotation (very slow)
        this.rotation.x += this.rotationSpeed.x;
        this.rotation.y += this.rotationSpeed.y;
        this.rotation.z += this.rotationSpeed.z;

        // Transform and project points
        const projectedPoints = this.points.map((point, index) => {
            let transformed = this.rotateX(point, this.rotation.x);
            transformed = this.rotateY(transformed, this.rotation.y);
            transformed = this.rotateZ(transformed, this.rotation.z);
            const projected = this.project(transformed);
            return {
                ...projected,
                index,
                lat: point.lat,
                lon: point.lon
            };
        }).filter(p => p.y > -50 && p.y < this.canvas.height + 50); // Only show points in/near viewport

        // Sort by z-depth
        const sortedPoints = projectedPoints.sort((a, b) => b.z - a.z);

        // Draw sparse connections (not all points connected)
        this.drawSparseConnections(projectedPoints);

        // Draw points
        sortedPoints.forEach(point => {
            const depth = (point.z + this.sphereRadius) / (this.sphereRadius * 2);
            const size = 2.5 + depth * 4;
            const alpha = 0.5 + depth * 0.5;

            // Green tint like The Thirteenth Floor
            const greenIntensity = 150 + depth * 105;

            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${greenIntensity * 0.4}, ${greenIntensity}, ${greenIntensity * 0.5}, ${alpha})`;
            this.ctx.fill();

            // Add glow to closer points
            if (depth > 0.5) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = `rgba(${greenIntensity * 0.4}, ${greenIntensity}, ${greenIntensity * 0.5}, ${alpha * 0.8})`;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
    }

    drawSparseConnections(points) {
        const maxDistance = 250;
        const connectionProbability = 0.2; // Only connect 20% of nearby points

        for (let i = 0; i < points.length; i += 3) { // Skip points for sparseness
            const pointA = points[i];

            // Only connect to some nearby points
            for (let j = i + 1; j < Math.min(i + 15, points.length); j += 2) {
                if (Math.random() > connectionProbability) continue;

                const pointB = points[j];
                const dx = pointA.x - pointB.x;
                const dy = pointA.y - pointB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.15;
                    const depth = (pointA.z + this.sphereRadius) / (this.sphereRadius * 2);
                    const greenIntensity = 150 + depth * 105;

                    this.ctx.beginPath();
                    this.ctx.moveTo(pointA.x, pointA.y);
                    this.ctx.lineTo(pointB.x, pointB.y);
                    this.ctx.strokeStyle = `rgba(${greenIntensity * 0.4}, ${greenIntensity}, ${greenIntensity * 0.5}, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }

        // Add some grid lines for structure (latitude lines visible at top)
        this.drawGridLines(points);
    }

    drawGridLines(points) {
        // Group points by latitude
        const latGroups = {};
        points.forEach(point => {
            if (!latGroups[point.lat]) {
                latGroups[point.lat] = [];
            }
            latGroups[point.lat].push(point);
        });

        // Draw latitude lines (circular at top of sphere)
        Object.values(latGroups).forEach((group, idx) => {
            if (idx % 2 !== 0) return; // Only every other line

            group.sort((a, b) => a.lon - b.lon);

            this.ctx.beginPath();
            group.forEach((point, i) => {
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            });

            const depth = (group[0].z + this.sphereRadius) / (this.sphereRadius * 2);
            const greenIntensity = 150 + depth * 105;

            this.ctx.strokeStyle = `rgba(${greenIntensity * 0.4}, ${greenIntensity}, ${greenIntensity * 0.5}, 0.08)`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new VectorWorld();
    });
} else {
    new VectorWorld();
}
