"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Droplets, Shield, Zap } from "lucide-react"
import Link from "next/link"
import Layout from "./components/layout"

export default function Home() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [sectors, setSectors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/api/alerts');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                if (data.error) {
                    setError(data.error);
                } else {
                    setAlerts(data.alerts || []);
                    setSectors(data.sectors || []);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Alert Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center text-primary-800">Alert</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {alerts.map((alert) => (
                            <Link href={`/industry/${alert.industry_code}`} key={alert.industry_code}>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{alert.industry_name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-red-600 font-bold">{alert.parameter} Threshold Crossed</p>
                                        <p className="text-sm">Current: {alert.current_value}</p>
                                        <p className="text-sm">Threshold: {alert.threshold_value}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Sectors / Industry Cards Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center text-primary-800">Industries We Serve</h2>
                    <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
                        {sectors.map((sector: any) => (
                            <Link href={`/industry-sector/${sector.id}`} key={sector.id}>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{sector.sector_name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold text-primary-600">{sector.count}</p>
                                        <CardDescription>Active Clients</CardDescription>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Features Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center text-primary-800">Key Features</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: "Real-time Monitoring",
                                icon: Zap,
                                description: "Continuous analysis of water quality parameters",
                            },
                            {
                                title: "AI-Powered Insights",
                                icon: BarChart,
                                description: "Advanced analytics for predictive maintenance",
                            },
                            { title: "Compliance Assurance", icon: Shield, description: "Ensure adherence to regulatory standards" },
                            {
                                title: "Eco-friendly Solutions",
                                icon: Droplets,
                                description: "Promote sustainable water management practices",
                            },
                        ].map((feature, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <feature.icon className="h-10 w-10 text-primary-600 mb-2" />
                                    <CardTitle>{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Statistics Section */}
                <section className="bg-primary-50 rounded-3xl p-8 mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center text-primary-800">River AI Impact</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { value: "99.9%", label: "Accuracy in Detecting Anomalies" },
                            { value: "50+", label: "Industries Served" },
                            { value: "1M+", label: "Gallons of Water Optimized Daily" },
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</p>
                                <p className="text-lg text-primary-700">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center text-sm text-gray-500 mt-16">
                    <p>&copy; 2025 River AI. All rights reserved.</p>
                    <p>Empowering industries with intelligent water quality monitoring solutions.</p>
                </footer>
            </div>
        </Layout>
    )
}

