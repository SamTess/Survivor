"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlideDeck, Slide } from '@/components/presentation/SlideDeck';
import { 
	Rocket, LineChart, AlertTriangle, Target, 
	CalendarClock, TrendingUp, Zap, Star, CheckCircle, Brain, Globe,
	Shield, Sparkles, Diamond, Building, Heart, Eye, MessageSquare,
	Clock, ArrowRight, Play, Database, Code, Palette, Trophy, Users,
	BarChart3, Lightbulb, Settings, Network, GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Keynote finale - Investisseurs - 10 minutes max - Focus impact & professionnalisme
const slides: Slide[] = [
	{
		id: 'intro',
		title: '',
		subtitle: '',
		content: (
			<div className="h-full w-full flex flex-col justify-center items-center relative">
				{/* Éléments décoratifs subtils */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 animate-pulse" />
					<div className="absolute bottom-20 left-16 w-24 h-24 rounded-full bg-gradient-to-tr from-accent/8 to-primary/8 animate-pulse" style={{animationDelay: '2s'}} />
					<Sparkles className="absolute top-1/4 right-1/4 w-6 h-6 text-purple-400/20 animate-pulse" style={{animationDelay: '1s'}} />
					<Diamond className="absolute bottom-1/4 left-1/4 w-5 h-5 text-accent/30 animate-pulse" style={{animationDelay: '3s'}} />
				</div>
				
				<div className="text-center relative z-10">
					<h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight">
						KEYNOTE SURVIVOR
					</h1>
					<p className="text-2xl md:text-3xl text-muted-foreground">
						12 Septembre 2025
					</p>
				</div>
			</div>
		)
	},
	{
		id: 'team',
		title: 'DLARPOU STUDIOS DEVELOPPEMENT',
		subtitle: 'Les acteurs clés du projet',
		content: (
			<div className="h-full w-full flex flex-col justify-center relative">
				{/* Éléments décoratifs */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute top-10 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary/15 to-transparent animate-pulse" />
					<div className="absolute bottom-20 right-16 w-24 h-24 rounded-full bg-gradient-to-tr from-accent/15 to-transparent animate-pulse" style={{animationDelay: '1s'}} />
					<Users className="absolute top-20 right-20 w-8 h-8 text-purple-400/30 animate-pulse" />
					<Star className="absolute bottom-20 left-20 w-6 h-6 text-accent/40 animate-pulse" style={{animationDelay: '2s'}} />
					<Trophy className="absolute top-1/2 left-10 w-6 h-6 text-secondary/40 animate-pulse" style={{animationDelay: '1.5s'}} />
				</div>
				
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
					{[
						{
							name: 'Samuel Tesson',
							role: 'Head of Backend & Product Manager',
							expertise: 'API Design • PostgreSQL • Product Strategy',
							icon: <Trophy className="w-12 h-12" />,
							colorClass: 'text-purple-400'
						},
						{
							name: 'Clément Talneau',
							role: 'Head of DevOps & Infrastructure',
							expertise: 'Docker • Terraform • CI/CD',
							icon: <Brain className="w-12 h-12" />,
							colorClass: 'text-purple-300'
						},
						{
							name: 'Mael Perrigaud',
							role: 'Head of Design & UX',
							expertise: 'Accessibiltité • User Research • Design System',
							icon: <Target className="w-12 h-12" />,
							colorClass: 'text-purple-400'
						},
						{
							name: 'Tristan Masse',
							role: 'Head of Frontend',
							expertise: 'React • TypeScript • Next.js',
							icon: <TrendingUp className="w-12 h-12" />,
							colorClass: 'text-purple-400'
						}
					].map((member, i) => (
						<div key={i} className="group relative p-6 rounded-3xl bg-gradient-to-br from-background/60 to-background/20 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 backdrop-blur-sm hover:scale-105">
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_70%_30%,rgb(193,116,242)/0.1,transparent_60%)]" />
							<div className="relative flex flex-col items-center gap-4 text-center">
								<div className={`${member.colorClass} drop-shadow-lg`}>{member.icon}</div>
								<div>
									<div className="font-bold text-lg">{member.name}</div>
									<div className="text-sm text-purple-400 font-semibold mb-2">{member.role}</div>
									<div className="text-xs text-muted-foreground">{member.expertise}</div>
								</div>
							</div>
						</div>
					))}
				</div>
				
				<div className="mt-12 text-center">
					<div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-400/10 to-purple-300/10 border border-purple-400/20 backdrop-blur-sm">
						<Users className="w-5 h-5 text-purple-400" />
						<span className="text-sm font-medium">Équipe complémentaire • Expérience startup • Vision partagée</span>
						<Star className="w-5 h-5 text-purple-300" />
					</div>
				</div>
			</div>
		)
	},
	{
		id: 'cover',
		title: 'SURVIVOR',
		subtitle: 'Plateforme de Mise en Relation Investisseurs-Entrepreneurs',
		content: (
			<div className="h-full w-full flex flex-col justify-center relative">
				{/* Éléments décoratifs de fond améliorés */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
					<div className="absolute bottom-20 left-16 w-24 h-24 rounded-full bg-gradient-to-tr from-accent/15 to-primary/15 animate-bounce" style={{animationDuration: '3s'}} />
					<div className="absolute top-20 left-20 w-20 h-20 rounded-full bg-gradient-to-bl from-secondary/15 to-transparent animate-pulse" style={{animationDelay: '2s'}} />
					<div className="absolute bottom-10 right-10 w-28 h-28 rounded-full bg-gradient-to-tr from-primary/10 to-transparent animate-pulse" style={{animationDelay: '4s'}} />
					<Sparkles className="absolute top-32 left-1/4 w-8 h-8 text-purple-400/30 animate-pulse" />
					<Diamond className="absolute bottom-32 right-1/3 w-6 h-6 text-accent/40 animate-pulse" style={{animationDelay: '1s'}} />
					<Star className="absolute top-1/4 right-10 w-7 h-7 text-secondary/40 animate-pulse" style={{animationDelay: '3s'}} />
					<Brain className="absolute bottom-1/4 left-10 w-6 h-6 text-purple-400/35 animate-pulse" style={{animationDelay: '2.5s'}} />
					<Trophy className="absolute top-10 left-1/2 w-5 h-5 text-accent/50 animate-pulse" style={{animationDelay: '1.8s'}} />
					<Rocket className="absolute bottom-10 left-1/3 w-6 h-6 text-secondary/45 animate-pulse" style={{animationDelay: '3.5s'}} />
				</div>

				<div className="grid md:grid-cols-4 gap-6 mt-8">
					{[{
						icon: <TrendingUp className="w-12 h-12" />, 
						label: 'CROISSANCE', 
						value: 'Activité Continue',
						colorClass: 'text-purple-400'
					},{
						icon: <Brain className="w-12 h-12" />, 
						label: 'INTELLIGENCE', 
						value: 'Évaluation Automatique',
						colorClass: 'text-purple-300'
					},{
						icon: <Zap className="w-12 h-12" />, 
						label: 'RAPIDITÉ', 
						value: 'Décisions Rapides',
						colorClass: 'text-purple-400'
					},{
						icon: <Star className="w-12 h-12" />, 
						label: 'QUALITÉ', 
						value: 'Information Précise',
						colorClass: 'text-purple-400'
					}].map((b,i)=>(
						<div key={i} className="group relative p-8 rounded-3xl bg-gradient-to-br from-background/60 to-background/20 border border-purple-400/20 hover:border-purple-400/50 transition-all duration-500 backdrop-blur-sm hover:scale-105">
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_70%_30%,rgb(193,116,242)/0.15,transparent_60%)]" />
							<div className="relative flex flex-col items-center gap-4 text-center">
								<div className={`${b.colorClass} drop-shadow-lg`}>{b.icon}</div>
								<div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{b.label}</div>
								<div className="text-lg font-semibold leading-tight">{b.value}</div>
							</div>
						</div>
					))}
				</div>
			</div>
		)
	},
	{
		id: 'problem',
		title: 'LE DÉFI',
		subtitle: 'Information utile vs Information inutile dans l\'écosystème startup',
		content: (
			<div className="h-full relative">
				{/* Éléments décoratifs améliorés */}
				<div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-bl from-destructive/10 to-transparent animate-pulse" />
				<div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-gradient-to-tr from-primary/10 to-transparent animate-pulse" style={{animationDelay: '1s'}} />
				<AlertTriangle className="absolute top-20 left-20 w-8 h-8 text-destructive/20 animate-pulse" style={{animationDelay: '2s'}} />
				<Target className="absolute bottom-20 right-20 w-8 h-8 text-purple-400/30 animate-pulse" style={{animationDelay: '3s'}} />
				<Sparkles className="absolute top-1/2 left-10 w-6 h-6 text-accent/40 animate-pulse" style={{animationDelay: '1.5s'}} />
				<Diamond className="absolute top-1/3 right-10 w-5 h-5 text-secondary/50 animate-pulse" style={{animationDelay: '2.5s'}} />
				<div className="flex justify-center items-center h-full">
					<div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
						{/* Problème */}
						<div className="flex justify-center">
							<div className="relative p-4 rounded-xl bg-gradient-to-br from-destructive/5 to-destructive/10 border border-destructive/30 backdrop-blur-sm max-w-md w-full">
								<div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
									<AlertTriangle className="w-3 h-3 text-destructive" />
								</div>
								<h4 className="font-bold text-base mb-3 text-destructive">PROBLÈME</h4>
								<div className="space-y-2">
									<div className="flex items-start gap-2">
										<Globe className="w-4 h-4 text-destructive/70 mt-0.5" />
										<div>
											<div className="font-semibold text-sm">Investisseurs</div>
											<div className="text-sm text-muted-foreground">Information tardive et trop présente • Temps de vérification</div>
										</div>
									</div>
									<div className="flex items-start gap-2">
										<Building className="w-4 h-4 text-destructive/70 mt-0.5" />
										<div>
											<div className="font-semibold text-sm">Fondateurs</div>
											<div className="text-sm text-muted-foreground">Visibilité • Feedback • Fragmentation</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Solution */}
						<div className="flex justify-center">
							<div className="relative max-w-md w-full">
								<div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-300/10 rounded-xl" />
								<div className="relative p-4 rounded-xl border border-purple-400/30 backdrop-blur-sm">
									<div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-purple-400/20 flex items-center justify-center">
										<Target className="w-3 h-3 text-purple-400" />
									</div>
									<h4 className="font-bold text-base mb-3 text-purple-400">SOLUTION</h4>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<CheckCircle className="w-5 h-5 text-purple-400" />
											<span className="font-semibold text-sm">Évaluation Automatique</span>
										</div>
										<div className="flex items-center gap-2">
											<Heart className="w-5 h-5 text-accent" />
											<span className="font-semibold text-sm">Suivi des Relations</span>
										</div>
										<div className="flex items-center gap-2">
											<Eye className="w-5 h-5 text-secondary" />
											<span className="font-semibold text-sm">Information Continue</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	},
	{
		id: 'solution',
		title: 'NOTRE SOLUTION',
		subtitle: 'Une plateforme unifiée • 4 piliers stratégiques',
		content: (
			<div className="h-full relative">
				{/* Éléments décoratifs animés améliorés */}
				<div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-spin" style={{animationDuration: '8s'}} />
				<div className="absolute bottom-10 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-transparent animate-bounce" style={{animationDuration: '4s'}} />
				<div className="absolute top-20 right-20 w-12 h-12 rounded-full bg-gradient-to-bl from-secondary/20 to-transparent animate-pulse" style={{animationDelay: '1s'}} />
				<div className="absolute bottom-20 left-20 w-14 h-14 rounded-full bg-gradient-to-tr from-primary/15 to-transparent animate-pulse" style={{animationDelay: '3s'}} />
				<Sparkles className="absolute top-1/4 right-1/4 w-6 h-6 text-purple-400/40 animate-pulse" />
				<Diamond className="absolute bottom-1/3 left-1/4 w-5 h-5 text-accent/50 animate-pulse" style={{animationDelay: '2s'}} />
				<Database className="absolute top-5 left-1/3 w-5 h-5 text-purple-400/30 animate-pulse" style={{animationDelay: '4s'}} />
				<CalendarClock className="absolute bottom-5 right-1/3 w-5 h-5 text-accent/35 animate-pulse" style={{animationDelay: '5s'}} />
				<LineChart className="absolute top-1/2 left-5 w-4 h-4 text-secondary/40 animate-pulse" style={{animationDelay: '2.5s'}} />
				<Brain className="absolute bottom-1/2 right-5 w-4 h-4 text-purple-400/45 animate-pulse" style={{animationDelay: '3.5s'}} />
				
				{/* Lignes de connexion stylisées multiples */}
				<div className="absolute top-1/2 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
				<div className="absolute top-1/3 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
				<div className="absolute bottom-1/3 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
				
				<div className="grid md:grid-cols-4 gap-8 h-full items-center">
					{[
						{
							icon: <Database className="w-8 h-8" />, 
							title: 'CATALOGUE', 
							desc: 'Recherche Ciblée',
							gradient: 'from-purple-400/10 to-purple-400/5',
							border: 'border-purple-400/30',
							iconColor: 'text-purple-400'
						},
						{
							icon: <CalendarClock className="w-8 h-8" />, 
							title: 'ÉVÉNEMENTS', 
							desc: 'Réseau & Rencontres',
							gradient: 'from-purple-300/10 to-purple-300/5',
							border: 'border-purple-300/30',
							iconColor: 'text-purple-300'
						},
						{
							icon: <LineChart className="w-8 h-8" />, 
							title: 'SUIVI', 
							desc: 'Évolution en Temps Réel',
							gradient: 'from-purple-400/10 to-purple-400/5',
							border: 'border-purple-400/30',
							iconColor: 'text-purple-400'
						},
						{
							icon: <Brain className="w-8 h-8" />, 
							title: 'ÉVALUATION', 
							desc: 'Classement Intelligent',
							gradient: 'from-purple-400/10 to-purple-300/5',
							border: 'border-purple-400/30',
							iconColor: 'text-purple-400'
						}
					].map((c,idx)=>(
						<div key={idx} className={`relative group p-8 rounded-3xl border ${c.border} bg-gradient-to-br ${c.gradient} backdrop-blur-sm hover:scale-105 transition-all duration-500 overflow-hidden`}>
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_50%_50%,theme(colors.primary)/0.1,transparent_70%)]" />
							<div className="relative flex flex-col items-center gap-4 text-center">
								<div className={`${c.iconColor} drop-shadow-lg`}>{c.icon}</div>
								<div className="font-bold text-sm tracking-wider">{c.title}</div>
								<div className="text-xs text-muted-foreground leading-tight">{c.desc}</div>
							</div>
							{/* Décoration coin */}
							<div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-br ${c.gradient} opacity-60`} />
						</div>
					))}
				</div>
			</div>
		)
	},
	{
		id: 'demo',
		title: 'DÉMO LIVE',
		subtitle: 'Découvrons la plateforme ensemble',
		content: (
			<div className="h-full relative flex items-center justify-center">
				{/* Éléments décoratifs spectaculaires */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
					<div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-gradient-to-tr from-accent/15 to-primary/15 animate-bounce" style={{animationDuration: '4s'}} />
					<div className="absolute top-1/4 right-1/3 w-24 h-24 rounded-full bg-gradient-to-bl from-secondary/20 to-transparent animate-pulse" style={{animationDelay: '1s'}} />
					<Play className="absolute top-10 right-10 w-12 h-12 text-primary/30 animate-pulse" />
					<Code className="absolute bottom-10 left-10 w-10 h-10 text-accent/30 animate-pulse" style={{animationDelay: '1.5s'}} />
					<Star className="absolute top-32 left-1/3 w-8 h-8 text-secondary/40 animate-pulse" style={{animationDelay: '2s'}} />
					<Diamond className="absolute bottom-32 right-1/4 w-6 h-6 text-primary/50 animate-pulse" style={{animationDelay: '0.5s'}} />
					<Sparkles className="absolute top-1/2 left-20 w-8 h-8 text-accent/40 animate-pulse" style={{animationDelay: '3s'}} />
				</div>
				
				{/* Contenu central */}
				<div className="relative z-10 text-center">
					<div className="mb-12">
						<p className="text-lg text-muted-foreground mb-8 max-w-2xl">
							Démonstration en direct de la plateforme Survivor
						</p>
					</div>
					
					{/* Bouton de retour stylisé */}
					<Link href="/">
						<Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-12 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
							<ArrowRight className="w-6 h-6 mr-3 rotate-180" />
							Retour au Menu Principal
							<Sparkles className="w-6 h-6 ml-3" />
						</Button>
					</Link>
				</div>
				
				{/* Lignes de connexion décoratives */}
				<div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 via-accent/20 to-transparent" />
				<div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 via-primary/20 to-transparent" />
			</div>
		)
	},
	{
		id: 'communication',
		title: 'COMMUNICATION CLIENT',
		subtitle: 'Qualité • Fréquence • Adaptation',
		content: (
			<div className="h-full relative">
				{/* Décorations améliorées */}
				<MessageSquare className="absolute top-10 right-10 w-12 h-12 text-primary/20 animate-pulse" />
				<Network className="absolute bottom-10 left-10 w-10 h-10 text-accent/20 animate-pulse" style={{animationDelay: '1s'}} />
				<Users className="absolute top-20 left-20 w-8 h-8 text-secondary/25 animate-pulse" style={{animationDelay: '2s'}} />
				<Clock className="absolute bottom-20 right-20 w-8 h-8 text-primary/30 animate-pulse" style={{animationDelay: '3s'}} />
				<BarChart3 className="absolute top-1/2 left-5 w-6 h-6 text-accent/35 animate-pulse" style={{animationDelay: '1.5s'}} />
				<Palette className="absolute bottom-1/3 right-5 w-6 h-6 text-secondary/40 animate-pulse" style={{animationDelay: '2.5s'}} />
				<CheckCircle className="absolute top-1/3 right-1/3 w-5 h-5 text-green-400/40 animate-pulse" style={{animationDelay: '4s'}} />
				<Star className="absolute bottom-1/4 left-1/4 w-5 h-5 text-primary/45 animate-pulse" style={{animationDelay: '0.8s'}} />
				
				<div className="grid md:grid-cols-2 gap-10 h-full items-center">
					{/* Méthodes de communication */}
					<div className="space-y-6">
						<h4 className="text-xl font-bold text-purple-400 mb-6">NOTRE APPROCHE</h4>
						{[
							{icon: <Users className="w-6 h-6" />, title: 'Préparation Initiale', desc: 'Indicateurs • Objectifs • Attentes'},
							{icon: <Clock className="w-6 h-6" />, title: 'Rythme Hebdomadaire', desc: 'Points réguliers • Transparence'},
							{icon: <BarChart3 className="w-6 h-6" />, title: 'Résumés Courts', desc: 'Information claire • Actions concrètes'},
							{icon: <Palette className="w-6 h-6" />, title: 'Ton Adapté', desc: 'Technique ↔ Commercial selon l&apos;interlocuteur'}
						].map((item, i) => (
							<div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-gradient-to-r from-purple-400/10 to-transparent border border-purple-400/30">
								<div className="text-purple-400 mt-1">{item.icon}</div>
								<div>
									<div className="font-semibold text-base">{item.title}</div>
									<div className="text-sm text-muted-foreground">{item.desc}</div>
								</div>
							</div>
						))}
					</div>
					
					{/* Résultats */}
					<div className="relative">
						<div className="p-4 rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-background backdrop-blur-sm">
							<h4 className="text-lg font-bold text-accent mb-4">RÉSULTATS</h4>
							<div className="space-y-3">
								<div className="flex items-center gap-3">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span className="text-sm">Communication fluide avec équipe technique</span>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span className="text-sm">Adaptation rapide aux changements de priorités</span>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span className="text-sm">Retours constructifs intégrés efficacement</span>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span className="text-sm">Relation de confiance établie</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	},
	{
		id: 'retro',
		title: 'POST-MORTEM',
		subtitle: 'Réflexion Structurée • Apprentissages • Amélioration',
		content: (
			<div className="h-full relative">
				{/* Décorations améliorées */}
				<Lightbulb className="absolute top-5 right-5 w-8 h-8 text-yellow-400/30 animate-pulse" />
				<Settings className="absolute bottom-5 left-5 w-8 h-8 text-blue-400/30 animate-pulse" style={{animationDelay: '1.5s'}} />
				<Star className="absolute top-20 left-20 w-6 h-6 text-green-400/30 animate-pulse" style={{animationDelay: '2s'}} />
				<AlertTriangle className="absolute bottom-20 right-20 w-6 h-6 text-orange-400/30 animate-pulse" style={{animationDelay: '3s'}} />
				<Rocket className="absolute top-1/2 right-10 w-6 h-6 text-blue-400/30 animate-pulse" style={{animationDelay: '1s'}} />
				<GitBranch className="absolute bottom-1/3 left-10 w-5 h-5 text-purple-400/30 animate-pulse" style={{animationDelay: '2.5s'}} />
				<Diamond className="absolute top-1/3 left-1/2 w-4 h-4 text-accent/40 animate-pulse" style={{animationDelay: '0.5s'}} />
				
				<div className="flex justify-center items-center h-full">
					<div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
						{/* Réussites */}
						<div className="relative flex justify-center">
							<div className="p-4 rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/10 backdrop-blur-sm max-w-xs w-full">
								<div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
									<CheckCircle className="w-4 h-4 text-green-500" />
								</div>
								<h4 className="font-bold text-lg mb-4 text-green-500">RÉUSSITES</h4>
								<div className="space-y-3">
									<div className="flex items-start gap-2">
										<Star className="w-4 h-4 text-green-500/70 mt-1 flex-shrink-0" />
										<span className="text-base">Développement rapide</span>
									</div>
									<div className="flex items-start gap-2">
										<Star className="w-4 h-4 text-green-500/70 mt-1 flex-shrink-0" />
										<span className="text-base">Base solide et évolutive</span>
									</div>
									<div className="flex items-start gap-2">
										<Star className="w-4 h-4 text-green-500/70 mt-1 flex-shrink-0" />
										<span className="text-base">Réactivité de l&apos;équipe</span>
									</div>
									<div className="flex items-start gap-2">
										<Star className="w-4 h-4 text-green-500/70 mt-1 flex-shrink-0" />
										<span className="text-base">Échange avec le client</span>
									</div>
								</div>
							</div>
						</div>
						
						{/* Difficultés */}
						<div className="relative flex justify-center">
							<div className="p-4 rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-500/10 backdrop-blur-sm max-w-xs w-full">
								<div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
									<AlertTriangle className="w-4 h-4 text-orange-500" />
								</div>
								<h4 className="font-bold text-lg mb-4 text-orange-500">DIFFICULTÉS</h4>
								<div className="space-y-3">
									<div className="flex items-start gap-2">
										<AlertTriangle className="w-4 h-4 text-orange-500/70 mt-1 flex-shrink-0" />
										<span className="text-base">Tests en fin de cycle</span>
									</div>
									<div className="flex items-start gap-2">
										<AlertTriangle className="w-4 h-4 text-orange-500/70 mt-1 flex-shrink-0" />
										<span className="text-base">Changements de contexte fréquents</span>
									</div>
									<div className="flex items-start gap-2">
										<AlertTriangle className="w-4 h-4 text-orange-500/70 mt-1 flex-shrink-0" />
										<span className="text-base">Définition des événements</span>
									</div>
									<div className="flex items-start gap-2">
										<AlertTriangle className="w-4 h-4 text-orange-500/70 mt-1 flex-shrink-0" />
										<span className="text-base">Gestion des dépendances</span>
									</div>
								</div>
							</div>
						</div>
						
						{/* Améliorations */}
						<div className="relative flex justify-center">
							<div className="p-4 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-500/10 backdrop-blur-sm max-w-xs w-full">
								<div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
									<GitBranch className="w-4 h-4 text-blue-500" />
								</div>
								<h4 className="font-bold text-lg mb-4 text-blue-500">AMÉLIORATIONS</h4>
								<div className="space-y-3">
									<div className="flex items-start gap-2">
										<Rocket className="w-4 h-4 text-blue-500/70 mt-1 flex-shrink-0" />
										<span className="text-base">Tests automatiques dès le début</span>
									</div>
									<div className="flex items-start gap-2">
										<Rocket className="w-4 h-4 text-blue-500/70 mt-1 flex-shrink-0" />
										<span className="text-base">Environnement de test</span>
									</div>
									<div className="flex items-start gap-2">
										<Rocket className="w-4 h-4 text-blue-500/70 mt-1 flex-shrink-0" />
										<span className="text-base">Déploiement automatisé robuste</span>
									</div>
									<div className="flex items-start gap-2">
										<Rocket className="w-4 h-4 text-blue-500/70 mt-1 flex-shrink-0" />
										<span className="text-base">Documentation en continu</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	},
	{
		id: 'next',
		title: 'PROCHAINES ÉTAPES',
		subtitle: 'Capital → Impact • Roadmap • Opportunités',
		content: (
			<div className="h-full relative">
				{/* Décorations futuristes améliorées */}
				<div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-bl from-primary/20 to-transparent animate-pulse" />
				<div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-gradient-to-tr from-accent/20 to-transparent animate-pulse" style={{animationDelay: '1s'}} />
				<Rocket className="absolute top-1/4 right-1/4 w-8 h-8 text-primary/30 animate-pulse" />
				<Star className="absolute bottom-1/4 left-1/4 w-6 h-6 text-accent/40 animate-pulse" style={{animationDelay: '2s'}} />
				<Target className="absolute top-10 left-10 w-6 h-6 text-secondary/40 animate-pulse" style={{animationDelay: '3s'}} />
				<Shield className="absolute bottom-10 right-10 w-6 h-6 text-primary/40 animate-pulse" style={{animationDelay: '1.5s'}} />
				<TrendingUp className="absolute top-1/2 left-5 w-5 h-5 text-accent/50 animate-pulse" style={{animationDelay: '2.5s'}} />
				<Diamond className="absolute bottom-1/3 right-5 w-4 h-4 text-secondary/60 animate-pulse" style={{animationDelay: '0.8s'}} />
				<Sparkles className="absolute top-1/3 right-1/2 w-5 h-5 text-primary/40 animate-pulse" style={{animationDelay: '4s'}} />
				
				<div className="flex flex-col gap-8 h-full">
					{/* Priorités court terme */}
					<div className="flex justify-center items-center flex-1 pt-16">
						<div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full items-start">
							{[
								{
									title: 'PRIORITÉS TRIMESTRE 1', 
									items: ['Évaluation intelligente avancée', 'Analyses pour investisseurs', 'Événements en direct'],
									icon: <Target className="w-5 h-5" />,
									colorClass: 'text-purple-400',
									borderClass: 'border-purple-400/30',
									bgClass: 'from-purple-400/10',
									dotClass: 'bg-purple-400/50',
									bgIconClass: 'from-purple-400/20'
								}, 
								{
									title: 'AVANTAGE CONCURRENTIEL', 
									items: ['Données d\'évolution', 'Standard du marché', 'Réseau actif premium'],
									icon: <Shield className="w-5 h-5" />,
									colorClass: 'text-purple-300',
									borderClass: 'border-purple-300/30',
									bgClass: 'from-purple-300/10',
									dotClass: 'bg-purple-300/50',
									bgIconClass: 'from-purple-300/20'
								}, 
								{
									title: 'UTILISATION DU CAPITAL', 
									items: ['Enrichissement des données', 'Interface investisseur professionnelle', 'Connexions avec partenaires'],
									icon: <TrendingUp className="w-5 h-5" />,
									colorClass: 'text-slate-400',
									borderClass: 'border-slate-400/30',
									bgClass: 'from-slate-400/10',
									dotClass: 'bg-slate-400/50',
									bgIconClass: 'from-slate-400/20'
								}
							].map((section, i) => (
								<div key={i} className="flex justify-center">
									<div className={`relative p-4 rounded-xl border ${section.borderClass} bg-gradient-to-br ${section.bgClass} to-transparent backdrop-blur-sm max-w-xs w-full`}>
										<div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${section.bgIconClass} to-transparent flex items-center justify-center`}>
											<div className={`${section.colorClass}`}>{section.icon}</div>
										</div>
										<h4 className={`font-bold text-base mb-4 ${section.colorClass} tracking-wider`}>{section.title}</h4>
										<div className="space-y-3">
											{section.items.map((item, j) => (
												<div key={j} className="text-base text-muted-foreground flex items-center gap-2">
													<div className={`w-1.5 h-1.5 rounded-full ${section.dotClass}`} />
													{item}
												</div>
											))}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		)
	},
	{
		id: 'thanks',
		title: '',
		subtitle: '',
		content: (
			<div className="h-full w-full flex flex-col justify-center items-center relative">
				{/* Éléments décoratifs simples */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<Sparkles className="absolute top-32 left-1/4 w-8 h-8 text-purple-400/40 animate-pulse" />
					<Star className="absolute top-1/4 right-10 w-7 h-7 text-purple-300/50 animate-pulse" style={{animationDelay: '3s'}} />
					<Trophy className="absolute top-10 left-1/2 w-5 h-5 text-purple-400/60 animate-pulse" style={{animationDelay: '1.8s'}} />
				</div>

				<div className="text-center space-y-8">
					<div className="space-y-4">
						<h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
							Merci de votre attention
						</h1>
						<div className="w-32 h-1 bg-gradient-to-r from-purple-400 to-purple-300 mx-auto rounded-full"></div>
					</div>
					
					<div className="mt-12">
						<p className="text-2xl text-muted-foreground font-medium">
							Avez-vous des questions ?
						</p>
					</div>
				</div>
			</div>
		)
	}
];

// Composant pour gérer les paramètres de recherche
function PresentationContent() {
	const searchParams = useSearchParams();
	const initialSlide = searchParams.get('slide');

	return (
		<SlideDeck
			slides={slides}
			fullBleed
			autoPlayMs={0}
			className="flex-1"
			showProgress={false}
			showControls={false}
			showDots={false}
			showCounter={false}
			initialSlide={initialSlide || undefined}
		/>
	);
}

export default function PresentationPage() {
	return (
		<div className="w-full h-dvh flex flex-col">
			<Suspense fallback={
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-pulse text-lg">Chargement de la présentation...</div>
				</div>
			}>
				<PresentationContent />
			</Suspense>
		</div>
	);
}
