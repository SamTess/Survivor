"use client";
import React from 'react';
import { SlideDeck, Slide } from '@/components/presentation/SlideDeck';
import { Rocket, Users, LineChart, ClipboardCheck, Handshake, RefreshCw, AlertTriangle, Target, Layers, CalendarClock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const slides: Slide[] = [
	{
		id: 'title',
		title: 'Brief Investisseurs – JEB Incubator',
		subtitle: 'De la vision à la traction validée',
		content: (
			<div className="grid md:grid-cols-2 gap-10">
				<div className="space-y-6">
					<p className="text-lg">
						Parcours structuré : où nous en sommes, ce que nous avons appris, et
						comment nous passons à l’échelle avec efficience capitalistique.
					</p>
					<ul className="space-y-2 text-sm md:text-base">
						<li>• Récit clair centré sur la création de valeur</li>
						<li>• Démonstration produit en direct (aucun écran statique creux)</li>
						<li>• Apprentissages opérationnels & boucle d’itération</li>
						<li>• Chemin vers la défendabilité & la scalabilité</li>
					</ul>
					<p className="text-sm text-muted-foreground">
						Audience : investisseurs early-stage évaluant vitesse produit, rapidité
						d’apprentissage et effet réseau écosystème.
					</p>
				</div>
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div className="p-4 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
						<Rocket className="w-6 h-6 text-primary mb-2" />
						<div className="font-semibold">150+ startups</div>
						<div className="text-muted-foreground text-xs">Pipeline engagé</div>
					</div>
					<div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
						<Users className="w-6 h-6 text-accent mb-2" />
						<div className="font-semibold">500+ fondateurs</div>
						<div className="text-muted-foreground text-xs">Communauté</div>
					</div>
					<div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
						<LineChart className="w-6 h-6 text-secondary mb-2" />
						<div className="font-semibold">Deal flow actif</div>
						<div className="text-muted-foreground text-xs">Onboarding structuré</div>
					</div>
					<div className="p-4 rounded-xl bg-muted border border-border/50">
						<ClipboardCheck className="w-6 h-6 text-foreground mb-2" />
						<div className="font-semibold">Boucles validées</div>
						<div className="text-muted-foreground text-xs">Engagement mesuré</div>
					</div>
				</div>
			</div>
		),
	},
	{
		id: 'agenda',
		title: 'Agenda',
		content: (
			<div className="grid md:grid-cols-3 gap-6 text-sm md:text-base">
				<div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-background border border-primary/20">
					<h3 className="font-semibold mb-2 text-primary">
						1. Narratif & Produit
					</h3>
					<ul className="space-y-1">
						<li>• Problème & positionnement</li>
						<li>• Parcours produit</li>
						<li>• Valeur par acteur</li>
					</ul>
				</div>
				<div className="p-5 rounded-2xl bg-gradient-to-br from-accent/10 to-background border border-accent/20">
					<h3 className="font-semibold mb-2 text-accent">
						2. Exécution & Communication
					</h3>
					<ul className="space-y-1">
						<li>• Relation client</li>
						<li>• Adaptabilité & cadence</li>
						<li>• Clarté décisionnelle</li>
					</ul>
				</div>
				<div className="p-5 rounded-2xl bg-gradient-to-br from-secondary/10 to-background border border-secondary/20">
					<h3 className="font-semibold mb-2 text-secondary">
						3. Rétrospective & Suite
					</h3>
					<ul className="space-y-1">
						<li>• Points forts / limites</li>
						<li>• Processus internes</li>
						<li>• Où le capital accélère</li>
					</ul>
				</div>
			</div>
		),
	},
	{
		id: 'problem',
		title: 'Espace Problème',
		content: (
			<div className="grid md:grid-cols-2 gap-10">
				<div className="space-y-4 text-sm md:text-base">
					<p>Les fondateurs early-stage font face à une fragmentation d’accès :</p>
					<ul className="space-y-2">
						<li>• Attention investisseur qualifiée au stade de validation exact</li>
						<li>• Boucles de feedback structurées au-delà des demo days</li>
						<li>• Outils légers pour signaler la progression</li>
						<li>• Écosystème (mentors, partenaires, événements) dans une seule UX</li>
					</ul>
					<p className="text-muted-foreground text-sm">
						Les investisseurs manquent parallèlement de signaux standardisés pour
						comparer maturité & qualité d’engagement.
					</p>
				</div>
				<div className="space-y-4">
					<div className="p-5 rounded-xl bg-muted/50 border text-sm">
						<h4 className="font-semibold mb-2">Friction Marché</h4>
						<p className="text-muted-foreground">
							Bruit ⇢ filtrage faible ⇢ opportunités manquées ⇢ capital déployé plus
							lentement.
						</p>
					</div>
					<div className="p-5 rounded-xl bg-primary/10 border border-primary/30 text-sm">
						<h4 className="font-semibold mb-2 text-primary">Opportunité</h4>
						<p>
							Devenir la couche opérationnelle structurée où progrès, crédibilité et
							préparation capital convergent.
						</p>
					</div>
				</div>
			</div>
		),
	},
	{
		id: 'product-demo',
		title: 'Démonstration Produit (Live)',
		subtitle: 'Accueil → Catalogue → Tableau de bord → Boucles Fonctionnelles',
		content: (
			<div className="space-y-6 text-sm md:text-base">
				<p>Pendant la démo, nous soulignons :</p>
				<ul className="space-y-2">
					<li>• Accueil : positionnement & éléments de confiance</li>
					<li>• Catalogue : découverte structurée & filtres</li>
					<li>• Dashboard : suivi progression & artefacts d’engagement</li>
					<li>• Événements & News : activité récurrente de l’écosystème</li>
				</ul>
				<div className="grid md:grid-cols-3 gap-4">
					<div className="p-4 rounded-xl border bg-background/60 backdrop-blur-sm">
						<Target className="w-5 h-5 text-primary mb-2" />
						<div className="font-medium">Valeur Investisseur</div>
						<p className="text-xs text-muted-foreground">
							Signal structuré & temps de qualification réduit.
						</p>
					</div>
					<div className="p-4 rounded-xl border bg-background/60 backdrop-blur-sm">
						<Layers className="w-5 h-5 text-accent mb-2" />
						<div className="font-medium">Valeur Fondateur</div>
						<p className="text-xs text-muted-foreground">
							Visibilité, feedback, exposition qualifiée.
						</p>
					</div>
					<div className="p-4 rounded-xl border bg-background/60 backdrop-blur-sm">
						<CalendarClock className="w-5 h-5 text-secondary mb-2" />
						<div className="font-medium">Boucle Plateforme</div>
						<p className="text-xs text-muted-foreground">
							Événements récurrents → rétention & densité de données.
						</p>
					</div>
				</div>
				<p className="text-muted-foreground text-xs">
					En cas de latence / auth : narration de l’intention + fallback sur
					exemples statiques.
				</p>
			</div>
		),
	},
	{
		id: 'communication',
		title: 'Relation Client & Communication',
		content: (
			<div className="grid md:grid-cols-2 gap-8 text-sm md:text-base">
				<div className="space-y-4">
					<h4 className="font-semibold">Principes</h4>
					<ul className="space-y-2">
						<li>• Alignement précoce sur métriques de succès</li>
						<li>• Mises à jour async lors des changements de priorité</li>
						<li>• Mémos décision condensés plutôt que longs fils</li>
						<li>• Ton adapté investisseur vs technique</li>
					</ul>
					<div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
						<p className="text-xs text-accent font-medium">
							Résultat : cycles d’itération plus rapides & moins de friction
							d’explication.
						</p>
					</div>
				</div>
				<div className="space-y-4">
					<h4 className="font-semibold">Canaux</h4>
					<ul className="space-y-2">
						<li>• Point hebdomadaire structuré</li>
						<li>• Loom courts pour pivots design</li>
						<li>• Labellisation claire (scope, risque, décision)</li>
						<li>• Clôture rapide des expérimentations</li>
					</ul>
					<div className="p-4 rounded-xl bg-muted/50 border text-xs text-muted-foreground leading-relaxed">
						Densité & formalisme ajustés : synthèse orientée investisseur vs
						granularité tactique interne.
					</div>
				</div>
			</div>
		),
	},
	{
		id: 'retrospective',
		title: 'Rétrospective',
		content: (
			<div className="grid md:grid-cols-3 gap-6 text-sm md:text-base">
				<div className="p-5 rounded-2xl border bg-background/70 backdrop-blur-sm space-y-2">
					<h4 className="font-semibold flex items-center gap-2">
						<Handshake className="w-4 h-4 text-primary" /> Points Positifs
					</h4>
					<ul className="space-y-1">
						<li>• Itération rapide</li>
						<li>• Récit produit cohérent</li>
						<li>• Forte réactivité aux changements</li>
						<li>• Base modèle de données robuste</li>
					</ul>
				</div>
				<div className="p-5 rounded-2xl border bg-background/70 backdrop-blur-sm space-y-2">
					<h4 className="font-semibold flex items-center gap-2">
						<AlertTriangle className="w-4 h-4 text-destructive" /> Défis
					</h4>
					<ul className="space-y-1">
						<li>• Coût de switch de contexte</li>
						<li>• QA automatisée tardive</li>
						<li>• Quelques frictions onboarding edge-cases</li>
						<li>• Taxonomie événements à consolider</li>
					</ul>
				</div>
				<div className="p-5 rounded-2xl border bg-background/70 backdrop-blur-sm space-y-3">
					<h4 className="font-semibold flex items-center gap-2">
						<RefreshCw className="w-4 h-4 text-secondary" /> Si C’était à Refaire
					</h4>
					<ul className="space-y-1">
						<li>• Instrumentation & funnel plus tôt</li>
						<li>• Générateurs de données staging précoces</li>
						<li>• Tokens design plus stricts dès J1</li>
						<li>• Hooks pre-commit (types + accessibilité)</li>
					</ul>
					<div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs">
						Objectif : compresser le cycle d’itération sans sacrifier la fiabilité.
					</div>
				</div>
			</div>
		),
	},
	{
		id: 'forward',
		title: 'Stratégie À Venir',
		content: (
			<div className="space-y-6 text-sm md:text-base">
				<div className="grid md:grid-cols-3 gap-4">
					<div className="p-4 rounded-xl border bg-background/70">
						<h4 className="font-semibold mb-1">Focus Stratégique</h4>
						<ul className="space-y-1 text-xs md:text-sm">
							<li>• Densité de signal profils</li>
							<li>• Analytics côté investisseur</li>
							<li>• Boucles rétention événementielles</li>
						</ul>
					</div>
					<div className="p-4 rounded-xl border bg-background/70">
						<h4 className="font-semibold mb-1">Bases de Moat</h4>
						<ul className="space-y-1 text-xs md:text-sm">
							<li>• Ontologie progression structurée</li>
							<li>• Benchmarks inter-cohortes</li>
							<li>• Graphes relationnels</li>
						</ul>
					</div>
					<div className="p-4 rounded-xl border bg-background/70">
						<h4 className="font-semibold mb-1">Utilisation Capital</h4>
						<ul className="space-y-1 text-xs md:text-sm">
							<li>• Enrichissement données + prépa ML</li>
							<li>• UX raffinée parcours investisseur</li>
							<li>• Intégrations partenaires scalables</li>
						</ul>
					</div>
				</div>
				<div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30 text-xs md:text-sm">
					Objectif : couche opératoire par défaut early-stage — accélère signal
					investisseur & exposition qualifiée fondateur.
				</div>
			</div>
		),
	},
	{
		id: 'close',
		title: 'Clôture & Prochaines Étapes',
		content: (
			<div className="space-y-6 text-sm md:text-base">
				<div className="grid md:grid-cols-2 gap-6">
					<div className="p-5 rounded-2xl border bg-background/70 space-y-2">
						<h4 className="font-semibold flex items-center gap-2">
							<MessageSquare className="w-4 h-4 text-primary" /> Discussion
						</h4>
						<ul className="space-y-1 text-sm">
							<li>• Profondeur analytics investisseur ?</li>
							<li>• Jalons effets réseau données</li>
							<li>• Priorisation : features vs scale</li>
						</ul>
					</div>
					<div className="p-5 rounded-2xl border bg-background/70 space-y-2">
						<h4 className="font-semibold">Actions Immédiates</h4>
						<ul className="space-y-1 text-sm">
							<li>• Affiner modèle de scoring profil</li>
							<li>• Étendre taxonomie événements</li>
							<li>• Préparer snapshot KPI investisseur</li>
						</ul>
					</div>
				</div>
				<div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
					<p className="text-muted-foreground text-xs md:text-sm">
						Merci pour votre attention. Disponible pour creuser modèle de données,
						roadmap ou partenariats.
					</p>
					<div className="flex gap-3">
						<Link href="/projects">
							<Button size="sm" className="rounded-full">
								Voir Catalogue
							</Button>
						</Link>
						<Link href="/dashboard">
							<Button
								size="sm"
								variant="outline"
								className="rounded-full"
							>
								Ouvrir Dashboard
							</Button>
						</Link>
					</div>
				</div>
			</div>
		),
	},
];

export default function PresentationPage() {
	return (
		<div className="pt-6 pb-6 px-4 md:px-8 h-screen max-w-7xl mx-auto flex flex-col">
			<div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
				<h1 className="text-2xl md:text-3xl font-bold tracking-tight">
					Présentation Investisseurs
				</h1>
			</div>
			<div className="flex-1 min-h-0">
				<SlideDeck
					slides={slides}
					autoPlayMs={0}
					className="h-full"
					tall
					showProgress={false}
					showControls={false}
					showDots={false}
					showCounter={false}
				/>
			</div>
		</div>
	);
}
