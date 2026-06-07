import {
    Component, OnInit, OnDestroy,
    inject, ElementRef, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminStatsService } from '../../../services/admin/admin-stats/admin-stats.service';
import { AdminStats, MonthlyGrowthPoint } from '../../../models/admin/admin-stats.model';

import { Chart, ChartDataset, ChartOptions, registerables } from 'chart.js';

Chart.register(...registerables);
@Component({
    selector: 'app-admin-stats',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-stats.component.html',
})
export class AdminStatsComponent implements OnInit, OnDestroy {
    private readonly _statsService = inject(AdminStatsService);
    private readonly _snackBar = inject(MatSnackBar);

    stats: AdminStats | null = null;
    isLoading = false;

    private charts: Chart[] = [];
    private statsData: AdminStats | null = null;

    // Setter-based ViewChild — fires when element enters the DOM
    @ViewChild('growthCanvas')
    set growthCanvas(el: ElementRef<HTMLCanvasElement> | undefined) {
        if (el && this.statsData) {
            setTimeout(() => this.buildGrowthChart(el.nativeElement, this.statsData!), 0);
        }
    }

    @ViewChild('revenueCanvas')
    set revenueCanvas(el: ElementRef<HTMLCanvasElement> | undefined) {
        if (el && this.statsData) {
            setTimeout(() => this.buildRevenueChart(el.nativeElement, this.statsData!), 0);
        }
    }

    @ViewChild('jobStatusCanvas')
    set jobStatusCanvas(el: ElementRef<HTMLCanvasElement> | undefined) {
        if (el && this.statsData) {
            setTimeout(() => this.buildJobStatusChart(el.nativeElement, this.statsData!), 0);
        }
    }

    @ViewChild('applicationCanvas')
    set applicationCanvas(el: ElementRef<HTMLCanvasElement> | undefined) {
        if (el && this.statsData) {
            setTimeout(() => this.buildApplicationChart(el.nativeElement, this.statsData!), 0);
        }
    }

    @ViewChild('subscriptionCanvas')
    set subscriptionCanvas(el: ElementRef<HTMLCanvasElement> | undefined) {
        if (el && this.statsData) {
            setTimeout(() => this.buildSubscriptionChart(el.nativeElement, this.statsData!), 0);
        }
    }

    ngOnInit(): void {
        this.loadStats();
    }

    ngOnDestroy(): void {
        this.destroyCharts();
    }

    loadStats(): void {
        this.isLoading = true;
        this._statsService.getStats().subscribe({
            next: (res) => {
                this.statsData = res.data;
                this.stats = res.data;
                this.isLoading = false;
                // stats is set — Angular will now render the @if block
                // ViewChild setters will fire automatically when canvases appear
            },
            error: () => {
                this._snackBar.open('Failed to load stats', 'Close', { duration: 3000 });
                this.isLoading = false;
            },
        });
    }

    private destroyCharts(): void {
        this.charts.forEach((c) => c.destroy());
        this.charts = [];
    }

    private buildGrowthChart(canvas: HTMLCanvasElement, data: AdminStats): void {
        const labels = this.mergeMonthLabels(
            data.users.monthlyGrowth,
            data.companies.monthlyGrowth,
        );

        const datasets: ChartDataset<'line'>[] = [
            {
                label: 'Users',
                data: this.mapToMonthly(labels, data.users.monthlyGrowth),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
            },
            {
                label: 'Companies',
                data: this.mapToMonthly(labels, data.companies.monthlyGrowth),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
            },
        ];

        const options: ChartOptions<'line'> = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
        };

        this.charts.push(new Chart(canvas, { type: 'line', data: { labels, datasets }, options }));
    }

    private buildRevenueChart(canvas: HTMLCanvasElement, data: AdminStats): void {
        const labels = data.revenue.monthlyGrowth.map((p) => p.month);

        const datasets: ChartDataset<'line'>[] = [{
            label: 'Revenue (₹)',
            data: data.revenue.monthlyGrowth.map((p) => p.count),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139,92,246,0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
        }];

        const options: ChartOptions<'line'> = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
        };

        this.charts.push(new Chart(canvas, { type: 'line', data: { labels, datasets }, options }));
    }

    private buildJobStatusChart(canvas: HTMLCanvasElement, data: AdminStats): void {
        const s = data.jobs.byStatus;

        const datasets: ChartDataset<'doughnut'>[] = [{
            data: [s.active, s.draft, s.paused, s.closed, s.expired],
            backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#6b7280'],
        }];

        const options: ChartOptions<'doughnut'> = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } },
        };

        this.charts.push(new Chart(canvas, {
            type: 'doughnut',
            data: { labels: ['Active', 'Draft', 'Paused', 'Closed', 'Expired'], datasets },
            options,
        }));
    }

    private buildApplicationChart(canvas: HTMLCanvasElement, data: AdminStats): void {
        const s = data.applications.byStatus;

        const datasets: ChartDataset<'bar'>[] = [{
            label: 'Applications',
            data: [s.pending, s.reviewing, s.shortlisted, s.rejected, s.hired],
            backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#10b981'],
            borderRadius: 6,
        }];

        const options: ChartOptions<'bar'> = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
        };

        this.charts.push(new Chart(canvas, {
            type: 'bar',
            data: { labels: ['Pending', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'], datasets },
            options,
        }));
    }

    private buildSubscriptionChart(canvas: HTMLCanvasElement, data: AdminStats): void {
        const s = data.subscriptions;

        const datasets: ChartDataset<'doughnut'>[] = [{
            data: [s.active, s.cancelled, s.expired],
            backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
        }];

        const options: ChartOptions<'doughnut'> = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } },
        };

        this.charts.push(new Chart(canvas, {
            type: 'doughnut',
            data: { labels: ['Active', 'Cancelled', 'Expired'], datasets },
            options,
        }));
    }

    private mergeMonthLabels(...arrays: MonthlyGrowthPoint[][]): string[] {
        const set = new Set<string>();
        arrays.forEach((arr) => arr.forEach((p) => set.add(p.month)));
        return Array.from(set).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime(),
        );
    }

    private mapToMonthly(labels: string[], data: MonthlyGrowthPoint[]): number[] {
        const map = new Map(data.map((p) => [p.month, p.count]));
        return labels.map((label) => map.get(label) ?? 0);
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value);
    }
}